<?php

namespace App\Libraries;

/**
 * SmsService - Helper untuk mengirim SMS / WhatsApp melalui Gateway (Contoh: Fonnte)
 */
class SmsService
{
    // API TOKEN Fonnte (Aktif - Bot: 089636839658)
    private $apiKey = "dCjrCr37acYDWF9tvC8E"; 

    /**
     * Mengirim pesan ke nomor tertentu (WhatsApp/SMS via Fonnte)
     */
    public function sendMessage($target, $message)
    {
        // Jika token masih placeholder, kita buat simulasi saja agar tidak error
        if ($this->apiKey === "YOUR_FONNTE_TOKEN_HERE") {
            log_message('info', "FONNTE SIMULATION to $target: $message");
            return [
                'status'  => true,
                'message' => 'Simulasi: Pesan berhasil dikirim (Harap ganti YOUR_FONNTE_TOKEN_HERE dengan Token asli Anda)'
            ];
        }

        $curl = curl_init();

        // Sanitasi nomor target: Ubah 08xxx menjadi 628xxx sesuai format dunia
        $target = preg_replace('/^0/', '62', $target); 
        $target = preg_replace('/^\+/', '', $target); 

        curl_setopt_array($curl, array(
            CURLOPT_URL => 'https://api.fonnte.com/send',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => array(
                'target' => $target,
                'message' => $message,
                'countryCode' => '62',
            ),
            CURLOPT_HTTPHEADER => array(
                'Authorization: ' . $this->apiKey
            ),
        ));

        $response = curl_exec($curl);
        
        if (curl_errno($curl)) {
            $error_msg = curl_error($curl);
            curl_close($curl);
            return [
                'status' => false,
                'message' => 'Internal cURL Error: ' . $error_msg
            ];
        }

        curl_close($curl);
        $result = json_decode($response, true);

        return [
            'status'  => $result['status'] ?? false,
            'message' => $result['reason'] ?? ($result['message'] ?? 'Respons tidak dikenal dari Fonnte')
        ];
    }
}
