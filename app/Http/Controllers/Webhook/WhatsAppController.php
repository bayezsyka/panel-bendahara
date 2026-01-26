<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB; // Tambahkan DB Facade
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use App\Models\Mandor;
use App\Models\Expense;
use App\Models\ExpenseRequest;
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
            // SKENARIO 0: INPUT NOMINAL VIA TEKS (TANPA FOTO)
            // Format sederhana agar mandor nggak input kode:
            // - "Semen 150000"
            // - "Beli paku Rp 250.000"
            // ==========================================================
            if (!$hasMedia && !$cachedData && !empty($message)) {
                $parsed = $this->parseNominalMessage($message);
                if ($parsed) {
                    $projects = $mandor->projects()->where('status', 'ongoing')->get();

                    if ($projects->isEmpty()) {
                        $this->replyWhatsapp($sender, "❌ Anda tidak memiliki proyek aktif.");
                        return response()->json(['status' => 'no_project']);
                    }

                    $draftData = [
                        'flow' => 'nominal',
                        'mandor_id' => $mandor->id,
                        'title' => $parsed['title'],
                        'amount' => $parsed['amount'],
                        'transacted_at' => $parsed['transacted_at'] ?? date('Y-m-d'),
                        'description' => 'Input nominal via WhatsApp',
                        'receipt_image' => null,
                        'items' => null,
                        'project_id' => null,
                        'step' => 'select_project',
                    ];

                    // Jika mandor hanya punya 1 proyek aktif, langsung konfirmasi
                    if ($projects->count() === 1) {
                        $draftData['project_id'] = $projects->first()->id;
                        $draftData['step'] = 'confirmation';
                        Cache::put($sessionKey, $draftData, 600);
                        $this->sendNominalConfirmationMessage($sender, $draftData, $projects->first()->name);
                        return response()->json(['status' => 'nominal_one_project']);
                    }

                    // Banyak proyek -> minta pilih proyek
                    Cache::put($sessionKey, $draftData, 600);

                    $reply = "🏢 *Pilih Proyek*\nInput ini untuk proyek mana?\n\n";
                    foreach ($projects as $index => $p) {
                        $num = $index + 1;
                        $reply .= "{$num}. {$p->name}\n";
                    }
                    $reply .= "\nBalas dengan *ANGKA* (contoh: 1)";
                    $this->replyWhatsapp($sender, $reply);

                    return response()->json(['status' => 'nominal_select_project']);
                }
            }

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

                $this->replyWhatsapp($sender, "⏳ Foto diterima! AI sedang membaca detail item...");

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

                // Validasi items array, jika kosong buat dummy
                $items = $result['items'] ?? [];
                if (empty($items)) {
                    $items[] = [
                        'name' => 'Barang Belanjaan',
                        'quantity' => 1,
                        'price' => $result['total_amount'] ?? 0,
                        'total' => $result['total_amount'] ?? 0
                    ];
                }

                // Siapkan Data Draft dengan ITEMS
                $draftData = [
                    'flow' => 'receipt',
                    'mandor_id' => $mandor->id,
                    'title' => $result['title'] ?? 'Pengeluaran',
                    'amount' => $result['total_amount'] ?? 0, // Total header
                    'transacted_at' => $result['date'] ?? date('Y-m-d'),
                    'receipt_image' => $fileName,
                    'items' => $items, // Simpan array item
                    'project_id' => null,
                    'step' => 'confirmation'
                ];

                // --- CEK JUMLAH PROYEK ---
                if ($projects->count() == 1) {
                    $draftData['project_id'] = $projects->first()->id;
                    $draftData['step'] = 'confirmation';

                    Cache::put($sessionKey, $draftData, 600); // Simpan 10 menit
                    $this->sendConfirmationMessage($sender, $draftData, $projects->first()->name);
                } else {
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

                        if (($cachedData['flow'] ?? 'receipt') === 'nominal') {
                            $this->sendNominalConfirmationMessage($sender, $cachedData, $selectedProject->name);
                        } else {
                            $this->sendConfirmationMessage($sender, $cachedData, $selectedProject->name);
                        }
                    } else {
                        $this->replyWhatsapp($sender, "⚠️ Pilihan salah! Balas dengan angka 1 sampai " . $projects->count());
                    }
                    return response()->json(['status' => 'project_selection']);
                }

                // B. JIKA SEDANG KONFIRMASI AKHIR (STEP: CONFIRMATION)
                if ($cachedData['step'] === 'confirmation') {
                    if (in_array(strtolower($message), ['ya', 'ok', 'y', 'siap', 'lanjut', 'benar'])) {

                        $flow = $cachedData['flow'] ?? 'receipt';

                        // SEMUA FLOW (Nominal & Receipt/Gemini) masuk ke Pending Review Keuangan
                        // agar Bendahara bisa cek dulu sebelum masuk pembukuan.
                        ExpenseRequest::create([
                            'mandor_id' => $cachedData['mandor_id'],
                            'project_id' => $cachedData['project_id'],
                            'source' => 'whatsapp',
                            'input_type' => ($cachedData['flow'] ?? 'receipt') === 'nominal' ? 'nominal' : 'receipt',
                            'title' => $cachedData['title'],
                            'description' => 'Input via WhatsApp',
                            'amount' => $cachedData['amount'],
                            'transacted_at' => $cachedData['transacted_at'],
                            'receipt_image' => $cachedData['receipt_image'] ?? null,
                            'items' => $cachedData['items'] ?? null,
                            'status' => 'pending',
                        ]);

                        Cache::forget($sessionKey);
                        $this->replyWhatsapp($sender, "✅ *TERKIRIM!* Data masuk antrian review keuangan. Nanti akan diproses bendahara.");
                    } elseif (in_array(strtolower($message), ['batal', 'tidak', 'ga', 'no', 'salah'])) {
                        if (!empty($cachedData['receipt_image'])) {
                            Storage::disk('public')->delete($cachedData['receipt_image']);
                        }
                        Cache::forget($sessionKey);
                        if (($cachedData['flow'] ?? 'receipt') === 'nominal') {
                            $this->replyWhatsapp($sender, "🗑️ Input dibatalkan.");
                        } else {
                            $this->replyWhatsapp($sender, "🗑️ Laporan dibatalkan. Silakan kirim foto ulang.");
                        }
                    } else {
                        $this->replyWhatsapp($sender, "⚠️ Ketik *YA* untuk simpan atau *BATAL* untuk hapus.");
                    }
                    return response()->json(['status' => 'confirmation_process']);
                }
            }

            // Default Response
            if (!$hasMedia) {
                $this->replyWhatsapp(
                    $sender,
                    "Halo Pak {$mandor->name}.\n\n" .
                        "✅ *Kirim FOTO struk* untuk auto-baca item.\n" .
                        "✅ Atau kirim *URAIIAN + NOMINAL* (contoh: 'Beli semen 150000')."
                );
            }

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error("WA Error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function sendConfirmationMessage($target, $data, $projectName)
    {
        $total = number_format($data['amount'], 0, ',', '.');

        // Format list item untuk WA
        $itemListStr = "";
        foreach ($data['items'] as $item) {
            $price = number_format($item['price'], 0, ',', '.');
            $subtotal = number_format($item['total'], 0, ',', '.');
            // Cth: • 2x Semen (65.000) = 130.000
            $itemListStr .= "• {$item['quantity']}x {$item['name']} (@{$price}) = {$subtotal}\n";
        }

        $msg =  "✅ *Konfirmasi Data*\n" .
            "------------------\n" .
            "Proyek: *{$projectName}*\n" .
            "Toko: *{$data['title']}*\n" .
            "Tgl: {$data['transacted_at']}\n" .
            "------------------\n" .
            "*Rincian Item:*\n" .
            $itemListStr .
            "------------------\n" .
            "Total Nota: *Rp {$total}*\n\n" .
            "Balas *YA* jika benar.\n" .
            "Balas *BATAL* jika salah.";

        $this->replyWhatsapp($target, $msg);
    }

    private function sendNominalConfirmationMessage($target, $data, $projectName)
    {
        $total = number_format($data['amount'], 0, ',', '.');

        $msg =  "✅ *Konfirmasi Input Nominal*\n" .
            "------------------\n" .
            "Proyek: *{$projectName}*\n" .
            "Uraian: *{$data['title']}*\n" .
            "Tgl: {$data['transacted_at']}\n" .
            "------------------\n" .
            "Nominal: *Rp {$total}*\n\n" .
            "Balas *YA* jika benar.\n" .
            "Balas *BATAL* jika salah.";

        $this->replyWhatsapp($target, $msg);
    }

    /**
     * Parse pesan teks menjadi (uraian, nominal).
     * Contoh valid:
     * - "Beli semen 150000"
     * - "Beli paku Rp 250.000"
     * - "bensin 50rb" / "uang makan 2jt"
     */
    private function parseNominalMessage(string $message): ?array
    {
        $msg = trim($message);
        if ($msg === '') return null;

        // Cari kandidat nominal (ambil yang terakhir supaya uraian bisa mengandung angka lain)
        $pattern = '/(\d[\d.,]*)(?:\s*(rb|ribu|jt|juta))?/i';
        if (!preg_match_all($pattern, $msg, $matches, PREG_OFFSET_CAPTURE)) {
            return null;
        }

        $lastIndex = count($matches[0]) - 1;
        if ($lastIndex < 0) return null;

        $rawNumber = $matches[1][$lastIndex][0] ?? '';
        $suffix = strtolower($matches[2][$lastIndex][0] ?? '');
        $fullMatch = $matches[0][$lastIndex][0] ?? '';

        if ($rawNumber === '') return null;

        // Normalisasi angka
        $amount = null;
        if ($suffix !== '' && preg_match('/[.,]/', $rawNumber) && substr_count($rawNumber, '.') + substr_count($rawNumber, ',') === 1) {
            // Kemungkinan format desimal: 1.5jt / 1,5jt
            $float = (float) str_replace(',', '.', $rawNumber);
            $amount = $float;
        } else {
            // Angka biasa: 250.000 / 150000
            $digits = preg_replace('/\D+/', '', $rawNumber);
            if ($digits === '') return null;
            $amount = (float) $digits;
        }

        $multiplier = 1;
        if (in_array($suffix, ['rb', 'ribu'])) $multiplier = 1000;
        if (in_array($suffix, ['jt', 'juta'])) $multiplier = 1000000;
        $amount = $amount * $multiplier;

        // Filter nominal yang terlalu kecil / pesan bukan transaksi
        if ($amount < 1) return null;

        // Uraian = pesan tanpa bagian nominal
        $title = trim(str_ireplace($fullMatch, '', $msg));
        $title = trim(preg_replace('/\s+/', ' ', $title));
        $title = preg_replace('/\b(rp|rupiah)\b\s*/i', '', $title);
        $title = trim($title);

        if ($title === '') {
            $title = 'Pengeluaran';
        }

        return [
            'title' => $title,
            'amount' => (float) $amount,
            'transacted_at' => date('Y-m-d'),
        ];
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
