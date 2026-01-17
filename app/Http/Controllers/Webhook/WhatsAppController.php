<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use App\Models\Mandor;
use App\Models\Expense;
use App\Services\GeminiReceiptService;

class WhatsAppController extends Controller
{
    public function handle(Request $request)
    {
        try {
            $sender = $request->input('sender');
            $message = trim($request->input('message'));

            // Deteksi Gambar (Baileys / Fonnte)
            $mediaUrl = $request->input('url') ?? $request->input('file');
            $mediaBase64 = $request->input('media_base64');
            $hasMedia = !empty($mediaBase64) || (!empty($mediaUrl) && $mediaUrl !== 'null');

            // 1. Validasi Mandor
            $mandor = Mandor::where('whatsapp_number', $sender)->first();
            if (!$mandor) return response()->json(['status' => 'ignored']);

            // 2. Cek Cache Session
            $sessionKey = 'wa_session_' . $sender;
            $cachedData = Cache::get($sessionKey);

            // ==========================================================
            // SKENARIO 1: TERIMA GAMBAR BARU (MULAI PROSES)
            // ==========================================================
            if ($hasMedia) {
                // Ambil daftar proyek aktif mandor
                $projects = $mandor->projects()->where('status', 'ongoing')->get();

                if ($projects->isEmpty()) {
                    $this->replyWhatsapp($sender, "❌ Anda tidak memiliki proyek aktif.");
                    return response()->json(['status' => 'no_project']);
                }

                $this->replyWhatsapp($sender, "⏳ Foto diterima! AI sedang membaca...");

                // --- Proses Gambar ---
                $imageContent = !empty($mediaBase64) ? base64_decode($mediaBase64) : Http::get($mediaUrl)->body();
                $fileName = 'receipts/' . date('Y-m-d') . '_' . Str::random(10) . '.jpg';
                Storage::disk('public')->put($fileName, $imageContent);

                // --- Proses AI Gemini ---
                $gemini = new GeminiReceiptService();
                $result = $gemini->analyzeReceipt(base64_encode($imageContent));

                if (!$result) {
                    $this->replyWhatsapp($sender, "❌ Gagal membaca struk. Coba foto lebih jelas.");
                    return response()->json(['status' => 'error_ai']);
                }

                // Siapkan Data Sementara
                $draftData = [
                    'mandor_id' => $mandor->id,
                    'title' => $result['title'] ?? 'Pengeluaran',
                    'amount' => $result['amount'] ?? 0,
                    'description' => $result['description'] ?? '-',
                    'transacted_at' => $result['date'] ?? date('Y-m-d'),
                    'receipt_image' => $fileName,
                    'project_id' => null,
                    'step' => 'confirmation'
                ];

                // --- CEK JUMLAH PROYEK ---
                if ($projects->count() == 1) {
                    // Kalau cuma 1, langsung assign
                    $draftData['project_id'] = $projects->first()->id;
                    $draftData['step'] = 'confirmation';

                    Cache::put($sessionKey, $draftData, 600);
                    $this->sendConfirmationMessage($sender, $draftData, $projects->first()->name);
                } else {
                    // Kalau BANYAK PROYEK, masuk step pemilihan
                    $draftData['step'] = 'select_project';
                    Cache::put($sessionKey, $draftData, 600);

                    // Buat List Proyek
                    $reply = "🏢 *Pilih Proyek*\nBot bingung, ini bon buat proyek mana?\n\n";
                    foreach ($projects as $index => $p) {
                        $num = $index + 1;
                        $reply .= "{$num}. {$p->name}\n";
                    }
                    $reply .= "\nBalas dengan *ANGKA* (contoh: 1)";

                    $this->replyWhatsapp($sender, $reply);
                }

                return response()->json(['status' => 'processed_image']);
            }

            // ==========================================================
            // SKENARIO 2: MENERIMA BALASAN TEKS (INTERAKSI)
            // ==========================================================
            if ($cachedData) {
                // A. JIKA SEDANG MEMILIH PROYEK (STEP: SELECT_PROJECT)
                if ($cachedData['step'] === 'select_project') {
                    $projects = $mandor->projects()->where('status', 'ongoing')->get();
                    $choice = (int)$message;

                    if ($choice > 0 && $choice <= $projects->count()) {
                        $selectedProject = $projects[$choice - 1];

                        // Update Cache
                        $cachedData['project_id'] = $selectedProject->id;
                        $cachedData['step'] = 'confirmation';
                        Cache::put($sessionKey, $cachedData, 600);

                        $this->sendConfirmationMessage($sender, $cachedData, $selectedProject->name);
                    } else {
                        $this->replyWhatsapp($sender, "⚠️ Pilihan salah! Balas dengan angka 1 sampai " . $projects->count());
                    }
                    return response()->json(['status' => 'project_selection']);
                }

                // B. JIKA SEDANG KONFIRMASI AKHIR (STEP: CONFIRMATION)
                if ($cachedData['step'] === 'confirmation') {
                    if (in_array(strtolower($message), ['ya', 'ok', 'y', 'siap'])) {

                        // === PERBAIKAN DI SINI (SESUAIKAN DENGAN NAMA KOLOM DB) ===
                        Expense::create([
                            'project_id'    => $cachedData['project_id'],
                            'title'         => $cachedData['title'],
                            'amount'        => $cachedData['amount'],
                            'description'   => $cachedData['description'],

                            // Ganti nama key kiri sesuai kolom DB kamu
                            // Jika di DB namanya 'date', ubah jadi 'date'
                            // Jika 'transacted_at', biarkan 'transacted_at'
                            'transacted_at' => $cachedData['transacted_at'],

                            // Jika di DB namanya 'image_path', ubah key kiri jadi 'image_path'
                            // Jika 'receipt_image', biarkan 'receipt_image'
                            'receipt_image' => $cachedData['receipt_image'],

                            'status'        => 'pending'
                        ]);
                        // ==========================================================

                        Cache::forget($sessionKey);
                        $this->replyWhatsapp($sender, "✅ *BERHASIL!* Laporan tersimpan.");
                    } elseif (in_array(strtolower($message), ['batal', 'tidak', 'ga', 'no'])) {
                        Storage::disk('public')->delete($cachedData['receipt_image']);
                        Cache::forget($sessionKey);
                        $this->replyWhatsapp($sender, "🗑️ Laporan dibatalkan. Silakan kirim foto ulang.");
                    } else {
                        $this->replyWhatsapp($sender, "⚠️ Ketik *YA* untuk simpan atau *BATAL* untuk hapus.");
                    }
                    return response()->json(['status' => 'confirmation_process']);
                }
            }

            // Default Response
            if (!$hasMedia) {
                $this->replyWhatsapp($sender, "Halo Pak {$mandor->name}. Kirim foto struk untuk lapor pengeluaran.");
            }

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error("WA Error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function sendConfirmationMessage($target, $data, $projectName)
    {
        $amount = number_format($data['amount'], 0, ',', '.');
        $msg =  "✅ *Konfirmasi Data*\n" .
            "------------------\n" .
            "Proyek: *{$projectName}*\n" .
            "Toko: {$data['title']}\n" .
            "Item: {$data['description']}\n" .
            "Total: *Rp {$amount}*\n" .
            "Tgl: {$data['transacted_at']}\n" .
            "------------------\n" .
            "Balas *YA* jika benar.\n" .
            "Balas *BATAL* jika salah.";

        $this->replyWhatsapp($target, $msg);
    }

    private function replyWhatsapp($target, $message)
    {
        try {
            $url = env('WA_GATEWAY_URL', 'http://127.0.0.1:3010/send');
            Http::post($url, ['to' => $target, 'message' => $message]);
        } catch (\Exception $e) {
            Log::error("Gagal kirim WA: " . $e->getMessage());
        }
    }
}
