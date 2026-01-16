<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiReceiptService
{
    protected $apiKey;
    // Pakai model flash yang terbaru biar support JSON Mode
    protected $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
    }

    public function analyzeReceipt($imageBase64)
    {
        // Prompt yang lebih paham konteks Indonesia (QRIS, Struk, Nota Tulis Tangan)
        $prompt = "Kamu adalah asisten keuangan proyek. Tugasmu adalah mengekstrak data dari gambar struk, nota, atau bukti transfer (QRIS/M-Banking).
        
        Aturan Ekstraksi:
        1. 'title': Nama Toko, Merchant, atau Nama Penerima Transfer.
        2. 'amount': Total nominal (HANYA ANGKA, tanpa Rp atau titik).
        3. 'date': Tanggal transaksi format YYYY-MM-DD. (PENTING: Jika tidak ada tanggal di gambar, gunakan tanggal hari ini: " . date('Y-m-d') . ").
        4. 'description': Daftar barang yang dibeli. Jika ini bukti transfer/QRIS, tulis 'Pembayaran QRIS' atau 'Transfer Dana'.

        Keluaran HARUS JSON murni.";

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '?key=' . $this->apiKey, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                            [
                                'inline_data' => [
                                    'mime_type' => 'image/jpeg',
                                    'data' => $imageBase64
                                ]
                            ]
                        ]
                    ]
                ],
                // FITUR KUNCI: Memaksa output JSON (Biar gak error parsing)
                'generationConfig' => [
                    'response_mime_type' => 'application/json'
                ]
            ]);

            // Cek jika request gagal di level jaringan
            if ($response->failed()) {
                Log::error("Gemini API Error: " . $response->body());
                return null;
            }

            $json = $response->json();

            // Ambil text raw dari Gemini
            $rawText = $json['candidates'][0]['content']['parts'][0]['text'] ?? null;

            if (!$rawText) {
                Log::error("Gemini Empty Response: ", $json);
                return null;
            }

            // Bersihkan markdown json jika masih ada (kadang Gemini bandel)
            $cleaned = str_replace(['```json', '```'], '', $rawText);
            $data = json_decode($cleaned, true);

            // Validasi data minimal
            if (!isset($data['amount']) || !isset($data['title'])) {
                Log::warning("Gemini Incomplete Data: " . $rawText);
                return null;
            }

            // Pastikan amount jadi integer murni
            $data['amount'] = (int) preg_replace('/\D/', '', $data['amount']);

            return $data;
        } catch (\Exception $e) {
            Log::error("Gemini Service Exception: " . $e->getMessage());
            return null;
        }
    }
}
