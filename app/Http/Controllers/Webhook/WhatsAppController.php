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
     * Handle Webhook Masuk (Support Fonnte & Local Baileys)
     */
    public function handle(Request $request)
    {
        try {
            // === 1. LOGGING & DATA CAPTURE ===
            // Kita log dulu biar tau format data yang masuk
            Log::info("WA_INCOMING", $request->all());

            $sender = $request->input('sender'); // No HP Pengirim
            $message = trim($request->input('message')); // Isi Pesan Text

            // === 2. DETEKSI MEDIA (GAMBAR) ===
            // Cek apakah ada data gambar dari berbagai sumber
            $mediaUrl = $request->input('url') ?? $request->input('file'); // Dari Fonnte
            $mediaBase64 = $request->input('media_base64'); // Dari Baileys Lokal

            // Validasi: Dianggap punya media jika ada Base64 ATAU ada URL valid
            $hasMedia = !empty($mediaBase64) || (!empty($mediaUrl) && $mediaUrl !== 'null');

            // === 3. VALIDASI PENGIRIM ===
            if (!$sender) {
                return response()->json(['status' => 'ignored', 'reason' => 'no_sender']);
            }

            // Cek apakah Mandor terdaftar di database
            $mandor = Mandor::where('whatsapp_number', $sender)->first();
            if (!$mandor) {
                // Opsional: Balas jika nomor tidak dikenal
                // $this->replyWhatsapp($sender, "❌ Nomor Anda belum terdaftar.");
                return response()->json(['status' => 'ignored', 'reason' => 'unregistered']);
            }

            // Cek apakah Mandor punya proyek aktif
            $activeProject = $mandor->projects()->where('status', 'ongoing')->first();
            if (!$activeProject) {
                $this->replyWhatsapp($sender, "Halo {$mandor->name}, Anda tidak memiliki proyek aktif saat ini.");
                return response()->json(['status' => 'ignored', 'reason' => 'no_project']);
            }

            // Cek Session Cache (Apakah user sedang dalam proses konfirmasi?)
            $sessionKey = 'wa_session_' . $sender;
            $pendingData = Cache::get($sessionKey);

            // ==========================================================
            // SKENARIO 1: TERIMA GAMBAR BARU (PROSES AI)
            // ==========================================================
            if ($hasMedia) {
                $this->replyWhatsapp($sender, "⏳ Foto diterima! Sedang dianalisis oleh AI...");

                $tempImageContent = null;

                try {
                    // A. JIKA DARI BAILEYS (BASE64)
                    if (!empty($mediaBase64)) {
                        // Bersihkan header data:image/jpeg;base64, jika ada
                        $mediaBase64 = preg_replace('#^data:image/\w+;base64,#i', '', $mediaBase64);
                        $tempImageContent = base64_decode($mediaBase64);
                    }
                    // B. JIKA DARI FONNTE (URL)
                    elseif (!empty($mediaUrl) && str_contains($mediaUrl, 'http')) {
                        $tempImageContent = Http::timeout(10)->get($mediaUrl)->body();
                    }

                    // Validasi Konten Gambar
                    if (empty($tempImageContent)) {
                        throw new \Exception("Gagal mengambil isi gambar.");
                    }
                } catch (\Exception $e) {
                    Log::error("IMAGE_ERROR: " . $e->getMessage());
                    $this->replyWhatsapp($sender, "❌ Gagal memproses gambar. Pastikan sinyal bagus dan kirim ulang.");
                    return response()->json(['status' => 'error_download']);
                }

                // Kirim ke Gemini AI Service
                $base64ForAi = base64_encode($tempImageContent);
                $gemini = new GeminiReceiptService();
                $result = $gemini->analyzeReceipt($base64ForAi);

                if (!$result) {
                    $this->replyWhatsapp($sender, "❌ AI tidak bisa membaca struk ini. Pastikan foto jelas dan ada total harganya.");
                    return response()->json(['status' => 'error_ai']);
                }

                // Simpan Gambar ke Storage Laravel (Public)
                $fileName = 'receipts/' . Str::random(40) . '.jpg';
                Storage::disk('public')->put($fileName, $tempImageContent);

                // Simpan Data Sementara ke Cache (Tunggu Konfirmasi YA/BATAL)
                $confirmData = [
                    'project_id' => $activeProject->id,
                    'title' => $result['title'] ?? 'Pengeluaran Lainnya',
                    'amount' => $result['amount'] ?? 0,
                    'description' => $result['description'] ?? '-',
                    'transacted_at' => $result['date'] ?? date('Y-m-d'),
                    'receipt_image' => $fileName,
                ];

                // Simpan cache selama 10 menit
                Cache::put($sessionKey, $confirmData, 600);

                // Format Pesan Konfirmasi
                $reply = "✅ *Konfirmasi Laporan*\n" .
                    "----------------------\n" .
                    "Judul: *{$confirmData['title']}*\n" .
                    "Barang: {$confirmData['description']}\n" .
                    "Total: *Rp " . number_format($confirmData['amount'], 0, ',', '.') . "*\n" .
                    "Tanggal: {$confirmData['transacted_at']}\n" .
                    "----------------------\n" .
                    "Balas *YA* untuk simpan.\n" .
                    "Balas *BATAL* untuk hapus.";

                $this->replyWhatsapp($sender, $reply);
                return response()->json(['status' => 'success_analyzed']);
            }

            // ==========================================================
            // SKENARIO 2: KONFIRMASI (TEXT YA / BATAL)
            // ==========================================================
            if ($pendingData) {
                $msgLower = strtolower($message);

                if ($msgLower === 'ya' || $msgLower === 'ok') {
                    // Simpan ke Database Expenses
                    Expense::create($pendingData);

                    // Hapus Cache
                    Cache::forget($sessionKey);

                    $this->replyWhatsapp($sender, "✅ Laporan berhasil disimpan ke Keuangan!");
                } elseif ($msgLower === 'batal' || $msgLower === 'tidak') {
                    // Hapus File Gambar
                    Storage::disk('public')->delete($pendingData['receipt_image']);

                    // Hapus Cache
                    Cache::forget($sessionKey);

                    $this->replyWhatsapp($sender, "🗑️ Laporan dibatalkan.");
                } else {
                    $this->replyWhatsapp($sender, "⚠️ Format salah. Balas *YA* untuk simpan atau *BATAL* untuk hapus.");
                }

                return response()->json(['status' => 'processed_confirmation']);
            }

            // ==========================================================
            // SKENARIO 3: PESAN BIASA (DEFAULT)
            // ==========================================================
            // Jika user mengirim text biasa dan tidak sedang dalam sesi konfirmasi
            if (!$hasMedia && !$pendingData) {
                // Filter pesan sistem Fonnte yang mengganggu
                if ($message === "non-text message") {
                    // Ignore pesan error bawaan Fonnte
                    return response()->json(['status' => 'ignored_system_msg']);
                }

                // Balas instruksi default
                // Cek panjang pesan > 1 huruf biar gak spam reply
                if (strlen($message) > 1) {
                    $this->replyWhatsapp($sender, "Halo {$mandor->name}. Silakan kirim *FOTO NOTA/STRUK* untuk input laporan otomatis.");
                }
            }

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error("WEBHOOK CONTROLLER ERROR: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Fungsi Kirim Pesan (Kompatibel dengan Local Gateway & Fonnte)
     */
    private function replyWhatsapp($target, $message)
    {
        try {
            // Prioritas 1: Gunakan Local Gateway (Baileys) jika ada di .env
            // Setting di .env: WA_GATEWAY_URL=http://127.0.0.1:3010/send
            $localGatewayUrl = env('WA_GATEWAY_URL', 'http://127.0.0.1:3010/send');

            // Kita coba tembak ke local gateway dulu
            $response = Http::post($localGatewayUrl, [
                'to' => $target,
                'message' => $message,
            ]);

            // Jika gagal atau gateway tidak aktif, fallback ke Fonnte (Opsional)
            if ($response->failed()) {
                Log::warning("Local Gateway failed, trying Fonnte...");

                Http::withHeaders(['Authorization' => env('FONNTE_TOKEN')])
                    ->post('https://api.fonnte.com/send', [
                        'target' => $target,
                        'message' => $message,
                    ]);
            }
        } catch (\Exception $e) {
            Log::error("REPLY ERROR: " . $e->getMessage());
        }
    }
}
