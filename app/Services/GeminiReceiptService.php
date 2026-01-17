<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiReceiptService
{
    protected $apiKey;

    protected $models = [
        'gemini-2.5-flash',
    ];

    public function __construct()
    {
        // અહી તમારી સાચી API KEY ડબલ અવતરણ ચિહ્નો (" ") ની અંદર મૂકો
        // ઉદાહરણ તરીકે: "AIzaSyD..."
        $this->apiKey = "AIzaSyDwDcNoJLaw0jULzrQ9XEfFrmvHi4su6wE";
    }

    public function analyzeReceipt($imageBase64)
    {
        $prompt = "
        PERAN: Kamu adalah mesin OCR canggih khusus struk belanja & Bukti Transfer (QRIS) Indonesia.
        TUGAS: Ekstrak data JSON dari gambar.
        
        Rules:
        1. title: Nama Toko/Merchant. (Contoh: 'Indomaret', 'Gopay Topup').
        2. amount: Nominal angka saja (Integer). Buang 'Rp', titik, koma. (Contoh: 50000).
        3. date: Tanggal (YYYY-MM-DD). Jika tidak ada, pakai hari ini: " . date('Y-m-d') . ".
        4. description: List item singkat.

        OUTPUT WAJIB JSON MURNI (Tanpa markdown ```json):
        { \"title\": \"...\", \"amount\": 0, \"date\": \"...\", \"description\": \"...\" }
        ";

        foreach ($this->models as $model) {
            try {
                // URL બનાવતી વખતે કી સાફ કરીએ છીએ
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
                            'temperature' => 0.2
                        ]
                    ]);

                if ($response->successful()) {
                    $json = $response->json();
                    $rawText = $json['candidates'][0]['content']['parts'][0]['text'] ?? null;

                    if ($rawText) {
                        Log::info("✅ BERHASIL DENGAN MODEL: {$model}");
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
