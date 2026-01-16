<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeminiReceiptService
{
    protected $apiKey;
    protected $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
    }

    public function analyzeReceipt($imageBase64)
    {
        $prompt = "Analisis gambar struk ini. Ekstrak data berikut dalam format JSON murni tanpa markdown: 
        {
            'title': 'Nama Toko/Judul Pengeluaran',
            'date': 'YYYY-MM-DD',
            'amount': 'Total Nominal (hanya angka)',
            'description': 'Daftar item yang dibeli (singkat)'
        }. 
        Jika tanggal tidak ada, gunakan tanggal hari ini.";

        $response = Http::post($this->baseUrl . '?key=' . $this->apiKey, [
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
            ]
        ]);

        $json = $response->json();

        // Parsing logic untuk mengambil text dari response Gemini
        try {
            $rawText = $json['candidates'][0]['content']['parts'][0]['text'];
            // Bersihkan markdown ```json ... ``` jika ada
            $cleaned = str_replace(['```json', '```'], '', $rawText);
            return json_decode($cleaned, true);
        } catch (\Exception $e) {
            return null;
        }
    }
}
