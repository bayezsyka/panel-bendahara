<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

// Model & Service
use App\Models\Mandor;
use App\Models\Expense;
use App\Services\GeminiReceiptService;

class WhatsAppController extends Controller
{
    /**
     * Handle incoming Webhook from WhatsApp Gateway (Node whatsapp-web.js)
     */
    public function handle(Request $request)
    {
        try {
            // === LOG RAW PAYLOAD ===
            Log::info("INCOMING MESSAGE:", $request->all());

            // sender bisa berupa "62812xxx@c.us" dari whatsapp-web.js
            $rawSender = (string) ($request->input('sender') ?? $request->input('from') ?? '');
            $sender = $this->normalizePhone($rawSender); // hasil: "62812xxxx"

            $message = trim((string) ($request->input('message') ?? $request->input('body') ?? ''));
            $type = (string) ($request->input('type') ?? 'text');

            // Support 2 bentuk media:
            // 1) base64 dari Node gateway: media_base64 + mimetype
            // 2) url/file (legacy/provider lain)
            $mediaBase64 = $request->input('media_base64');
            $mimeType = (string) ($request->input('mimetype') ?? '');
            $mediaUrl = $request->input('url') ?? $request->input('file') ?? null;

            $hasMedia = !empty($mediaBase64) || !empty($mediaUrl);

            Log::info("PARSED:", [
                'rawSender' => $rawSender,
                'senderNormalized' => $sender,
                'message' => $message,
                'type' => $type,
                'hasMedia' => $hasMedia,
                'mimeType' => $mimeType,
                'mediaUrlExists' => !empty($mediaUrl),
                'mediaBase64Exists' => !empty($mediaBase64),
            ]);

            // === Cari Mandor ===
            // Catatan: whatsapp_number di DB harus format "628xxxx"
            $mandor = Mandor::where('whatsapp_number', $sender)->first();

            if (!$mandor) {
                // Jangan silent, balas biar jelas
                $this->replyWA($sender, "❌ Nomor kamu belum terdaftar sebagai mandor.\n\nNomor terdeteksi: *{$sender}*\nMinta admin untuk daftarkan.");
                return response()->json(['status' => 'ignored', 'reason' => 'unregistered', 'sender' => $sender]);
            }

            // Cari Proyek Aktif (Ongoing) milik Mandor ini
            $activeProject = $mandor->projects()->where('status', 'ongoing')->first();
            if (!$activeProject) {
                $this->replyWA($sender, "Halo {$mandor->name}, Anda tidak memiliki proyek aktif saat ini.");
                return response()->json(['status' => 'error', 'reason' => 'no_active_project']);
            }

            // Cek Sesi Cache (Apakah sedang menunggu konfirmasi?)
            $sessionKey = 'wa_session_' . $sender;
            $pendingData = Cache::get($sessionKey);

            // === SKENARIO 1: Mandor Kirim Gambar (Analisis AI) ===
            if ($hasMedia && !$pendingData) {
                $this->replyWA($sender, "⏳ Sedang menganalisis struk, mohon tunggu...");

                // Ambil konten gambar (binary) + base64 untuk Gemini
                $tempImageContent = null;
                $base64Image = null;

                if (!empty($mediaBase64)) {
                    // Dari Node gateway (base64 murni)
                    $tempImageContent = base64_decode($mediaBase64);
                    $base64Image = $mediaBase64;
                } elseif (!empty($mediaUrl)) {
                    // Dari provider lain yang ngasih URL
                    $tempImageContent = @file_get_contents($mediaUrl);
                    if ($tempImageContent !== false) {
                        $base64Image = base64_encode($tempImageContent);
                    }
                }

                if (!$tempImageContent || !$base64Image) {
                    $this->replyWA($sender, "❌ Gagal membaca gambar. Silakan kirim ulang foto struk dengan jelas.");
                    return response()->json(['status' => 'error', 'reason' => 'media_empty']);
                }

                // Panggil Service Gemini AI
                $gemini = new GeminiReceiptService();
                $result = $gemini->analyzeReceipt($base64Image);

                if (!$result) {
                    $this->replyWA($sender, "❌ Gagal membaca struk. Pastikan foto jelas dan pencahayaan cukup. Silakan kirim ulang.");
                    return response()->json(['status' => 'error', 'reason' => 'ai_failed']);
                }

                // Simpan gambar ke storage public agar bisa diakses nanti
                $ext = 'jpg';
                if (!empty($mimeType)) {
                    if (str_contains($mimeType, 'png')) $ext = 'png';
                    if (str_contains($mimeType, 'jpeg') || str_contains($mimeType, 'jpg')) $ext = 'jpg';
                }

                $fileName = 'receipts/' . Str::random(40) . '.' . $ext;
                Storage::disk('public')->put($fileName, $tempImageContent);

                // Siapkan data untuk konfirmasi
                $confirmData = [
                    'project_id' => $activeProject->id,
                    'title' => $result['title'] ?? 'Pengeluaran Lainnya',
                    'amount' => $result['amount'] ?? 0,
                    'description' => $result['description'] ?? '-',
                    'transacted_at' => $result['date'] ?? date('Y-m-d'),
                    'receipt_image' => $fileName,
                ];

                // Simpan ke Cache selama 10 menit
                Cache::put($sessionKey, $confirmData, 600);

                // Format Pesan Konfirmasi
                $reply = "✅ *Konfirmasi Laporan Pengeluaran*\n\n" .
                    "Proyek: {$activeProject->name}\n" .
                    "Toko/Judul: *{$confirmData['title']}*\n" .
                    "Tanggal: {$confirmData['transacted_at']}\n" .
                    "Item: {$confirmData['description']}\n" .
                    "Nominal: *Rp " . number_format((float)$confirmData['amount'], 0, ',', '.') . "*\n\n" .
                    "Balas *YA* untuk simpan data.\n" .
                    "Balas *BATAL* untuk membatalkan.";

                $this->replyWA($sender, $reply);
                return response()->json(['status' => 'success', 'action' => 'confirm_request']);
            }

            // === SKENARIO 2: Konfirmasi (YA / BATAL) ===
            if ($pendingData) {
                $msg = strtolower($message);

                if ($msg === 'ya') {
                    Expense::create([
                        'project_id' => $pendingData['project_id'],
                        'title' => $pendingData['title'],
                        'amount' => $pendingData['amount'],
                        'description' => $pendingData['description'],
                        'transacted_at' => $pendingData['transacted_at'],
                        'receipt_image' => $pendingData['receipt_image'],
                    ]);

                    Cache::forget($sessionKey);

                    $this->replyWA($sender, "✅ Laporan berhasil disimpan! Masuk ke pembukuan bendahara.");
                    return response()->json(['status' => 'success', 'action' => 'saved']);
                }

                if ($msg === 'batal') {
                    Storage::disk('public')->delete($pendingData['receipt_image']);
                    Cache::forget($sessionKey);

                    $this->replyWA($sender, "🚫 Laporan dibatalkan. Silakan kirim foto baru.");
                    return response()->json(['status' => 'success', 'action' => 'cancelled']);
                }

                $this->replyWA($sender, "Format salah. Balas *YA* untuk simpan atau *BATAL*.");
                return response()->json(['status' => 'success', 'action' => 'waiting_confirm']);
            }

            // === Jika kirim text biasa tanpa sesi ===
            if (!$hasMedia) {
                $this->replyWA($sender, "Halo {$mandor->name}. Silakan kirim *FOTO STRUK/NOTA* untuk input laporan pengeluaran otomatis.");
            }

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error("WhatsApp Error: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Normalisasi nomor ke format DB & gateway:
     * - "62812xxx@c.us" -> "62812xxx"
     * - "+62812xxx" -> "62812xxx"
     * - "0812xxx" -> "62812xxx"
     */
    private function normalizePhone(string $raw): string
    {
        $s = str_replace(['@c.us', '@s.whatsapp.net'], '', $raw);
        $s = str_replace(['+', ' '], '', $s);

        // hanya digit
        $digits = preg_replace('/[^0-9]/', '', $s) ?? '';

        if (str_starts_with($digits, '08')) {
            $digits = '62' . substr($digits, 1);
        }

        return $digits;
    }

    /**
     * Kirim balasan via Node gateway
     */
    private function replyWA(string $targetPhone, string $message): void
    {
        $gateway = rtrim(env('WA_GATEWAY_URL', 'http://127.0.0.1:3010'), '/');

        try {
            Log::info("SEND_TO_GATEWAY", [
                'url' => $gateway . '/send',
                'to' => $targetPhone,
                'message_preview' => mb_substr($message, 0, 120),
            ]);

            $response = Http::timeout(20)->post($gateway . '/send', [
                'to' => $targetPhone,     // harus angka murni
                'message' => $message,
            ]);

            Log::info("GATEWAY_RESPONSE", [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        } catch (\Exception $e) {
            Log::error("WA Gateway Error: " . $e->getMessage());
        }
    }
}
