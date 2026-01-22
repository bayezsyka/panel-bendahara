<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiReceiptService
{
    protected $apiKey;

    protected $models = [
        'gemini-2.5-flash', // Update ke model terbaru jika tersedia, atau tetap 1.5-flash
    ];

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');
    }

    public function analyzeReceipt($imageBase64)
    {
        $prompt = "
        PERAN: Kamu adalah mesin OCR canggih khusus struk belanja material bangunan & Bukti Transfer Indonesia.
        TUGAS: Ekstrak data struk menjadi JSON dengan detail item.
        
        Rules:
        1. title: Nama Toko/Merchant (Contoh: 'TB. Sinar Jaya', 'Indomaret').
        2. date: Tanggal (YYYY-MM-DD). Jika tidak ada, pakai hari ini: " . date('Y-m-d') . ".
        3. items: Array daftar barang. Wajib ekstrak per baris item.
           - name: Nama barang.
           - quantity: Jumlah barang (Integer/Float). Default 1.
           - price: Harga satuan (Integer). Buang 'Rp', titik.
           - total: Total harga per item (quantity * price).
        4. total_amount: Total bayar keseluruhan dari struk.

        OUTPUT WAJIB JSON MURNI (Tanpa markdown ```json):
        {
            \"title\": \"...\",
            \"date\": \"...\",
            \"total_amount\": 0,
            \"items\": [
                { \"name\": \"Semen Tiga Roda\", \"quantity\": 2, \"price\": 65000, \"total\": 130000 },
                { \"name\": \"Paku 5cm\", \"quantity\": 1, \"price\": 15000, \"total\": 15000 }
            ]
        }
        ";

        foreach ($this->models as $model) {
            try {
                $cleanKey = trim($this->apiKey);
                $url = "https://generativelanguage.googleapis.com/v1beta/models/" . $model . ":generateContent?key=" . $cleanKey;

                Log::info("Menghubungi Gemini model: " . $model);

                $response = Http::withHeaders(['Content-Type' => 'application/json'])
                    ->post($url, [
                        'contents' => [[
                            'parts' => [
                                ['text' => $prompt],
                                ['inline_data' => ['mime_type' => 'image/jpeg', 'data' => $imageBase64]]
                            ]
                        ]],
                        'generationConfig' => [
                            'temperature' => 0.2,
                            'response_mime_type' => 'application/json' // Memaksa output JSON
                        ]
                    ]);

                if ($response->successful()) {
                    $json = $response->json();
                    $rawText = $json['candidates'][0]['content']['parts'][0]['text'] ?? null;

                    if ($rawText) {
                        Log::info("✅ BERHASIL DENGAN MODEL: {$model}");
                        // Bersihkan markdown jika masih ada
                        $cleanText = str_replace(['```json', '```'], '', $rawText);
                        return json_decode($cleanText, true);
                    }
                } else {
                    Log::error("Gagal {$model}: " . $response->body());
                }
            } catch (\Exception $e) {
                Log::error("Exception {$model}: " . $e->getMessage());
            }
        }

        return null;
    }
}
