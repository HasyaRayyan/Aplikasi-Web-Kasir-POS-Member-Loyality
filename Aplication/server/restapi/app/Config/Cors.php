<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

class Cors extends BaseConfig
{
    public array $default = [

        // IZINKAN SEMUA ORIGIN (DEV MODE)
        'allowedOrigins' => ['*'],

        // Tidak perlu regex
        'allowedOriginsPatterns' => [],

        // Kalau pakai login/JWT nanti bisa true
        'supportsCredentials' => false,

        // HEADER YANG DIIZINKAN
        'allowedHeaders' => [
            'Content-Type',
            'Authorization',
            'X-Requested-With'
        ],

        // HEADER YANG BOLEH DIAKSES FE
        'exposedHeaders' => [],

        // METHOD YANG DIIZINKAN
        'allowedMethods' => [
            'GET',
            'POST',
            'PUT',
            'PATCH',
            'DELETE',
            'OPTIONS'
        ],

        'maxAge' => 7200,
    ];
}
