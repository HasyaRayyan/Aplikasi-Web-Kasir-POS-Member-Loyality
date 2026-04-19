<?php

namespace App\Controllers;

use App\Models\AuthModel;

class Auth extends BaseController
{
    protected $authModel;

    public function __construct()
    {
        $this->authModel = new AuthModel();
    }

    // =====================
    // GET /auth
    // =====================
    public function index()
    {
        $users = $this->authModel->findAll();

        return $this->response->setJSON([
            'status'  => 200,
            'message' => 'Auth API OK',
            'data'    => $users
        ]);
    }

    // =====================
    // POST /auth/login
    // =====================
public function login()
{
    $data = $this->request->getJSON(true);

    $identity = $data['username'] ?? null; // bisa username/email/name/phone
    $password = $data['password'] ?? null;

    if (!$identity || !$password) {
        return $this->response->setStatusCode(400)->setJSON([
            'success' => false,
            'message' => 'Username / Email / Phone wajib diisi'
        ]);
    }

    // CARI USER DENGAN 4 OPSI
    $user = $this->authModel->getByIdentity($identity);

    if (!$user) {
        return $this->response->setStatusCode(404)->setJSON([
            'success' => false,
            'message' => 'User tidak ditemukan'
        ]);
    }

    /* ================= PASSWORD CHECK =================
       SUPPORT PASSWORD LAMA PLAINTEXT + HASH BARU
    */
    $validPassword = false;

    if ($user['password'] === $password) {
        $validPassword = true;
    }

    if (password_verify($password, $user['password'])) {
        $validPassword = true;
    }

    if (!$validPassword) {
        return $this->response->setStatusCode(401)->setJSON([
            'success' => false,
            'message' => 'Password salah'
        ]);
    }

    unset($user['password']);

    return $this->response->setJSON([
        'success' => true,
        'message' => 'Login berhasil',
        'data' => [
            'id'       => $user['id'],
            'name'     => $user['name'],
            'username' => $user['username'],
            'email'    => $user['email'],
            'phone'    => $user['phone'],
            'role_id'  => $user['role_id'],
        ]
    ]);
}


// =====================
// POST /auth/logout
// =====================
public function logout()
{
    // kalau pakai session
    session()->destroy();

    return $this->response->setJSON([
        'success' => true,
        'message' => 'Logout berhasil'
    ]);
}

// =====================
// POST /auth/register
// =====================
public function register()
{
    $data = $this->request->getJSON(true);

    if (empty($data['phone']) || empty($data['name']) || empty($data['password'])) {
        return $this->response->setStatusCode(400)->setJSON([
            'success' => false,
            'message' => 'Field Phone, Name, dan Password wajib diisi'
        ]);
    }

    // Cek duplikasi nomor telp (Double Check)
    $existing = $this->authModel->getByIdentity($data['phone']);
    if ($existing) {
        return $this->response->setStatusCode(400)->setJSON([
            'success' => false,
            'message' => 'Nomor HP sudah terdaftar'
        ]);
    }

    // Generate random username if not supplied
    $username = $data['username'] ?? 'user' . time();

    // Pastikan pakai UserModel untuk menjamin members tertambahkan
    $userModel = new \App\Models\UserModel();
    
    // Siapkan struktur data yg diminta createUser()
    $userData = [
        'role_id' => 3, // Role Member = 3 biasanya
        'name' => $data['name'],
        'email' => $data['email'] ?? null,
        'phone' => $data['phone'],
        'username' => $username,
        'password' => $data['password'],
        'total_points' => 0
    ];

    try {
        $userId = $userModel->createUser($userData);
        
        return $this->response->setJSON([
            'success' => true,
            'message' => 'Pendaftaran Member Berhasil',
            'data' => [
                'user_id' => $userId,
                'phone' => $data['phone']
            ]
        ]);
    } catch (\Exception $e) {
        return $this->response->setStatusCode(500)->setJSON([
            'success' => false,
            'message' => 'Gagal mendaftar: ' . $e->getMessage()
        ]);
    }
}

// =====================
// POST /auth/check-phone
// =====================
public function checkPhone()
{
    $data = $this->request->getJSON(true);
    $phone = $data['phone'] ?? null;

    if (!$phone) {
        return $this->response->setStatusCode(400)->setJSON([
            'success' => false,
            'message' => 'Nomor HP wajib diisi'
        ]);
    }

    $user = $this->authModel->getByIdentity($phone);

    if ($user) {
        return $this->response->setStatusCode(400)->setJSON([
            'success' => false,
            'message' => 'Nomor HP sudah terdaftar dan digunakan. Silakan gunakan nomor lain atau login.'
        ]);
    }

    return $this->response->setJSON([
        'success' => true,
        'message' => 'Nomor HP tersedia'
    ]);
}

// =====================
// POST /auth/send-otp
// =====================
public function sendOTP()
{
    $data = $this->request->getJSON(true);
    $phone = $data['phone'] ?? null;

    if (!$phone) {
        return $this->response->setStatusCode(400)->setJSON([
            'success' => false,
            'message' => 'Nomor HP wajib diisi'
        ]);
    }

    // 1. Generate OTP
    $otp = rand(1000, 9999);

    // 2. Kirim via SmsService
    $smsService = new \App\Libraries\SmsService();
    $message = "Kode OTP pendaftaran TheFourtyFour Anda adalah: $otp. JANGAN berikan kode ini ke siapa pun.";
    
    $result = $smsService->sendMessage($phone, $message);

    if ($result['status']) {
        return $this->response->setJSON([
            'success'       => true,
            'message'       => 'OTP berhasil dikirim ke nomor ' . $phone,
            'simulated_otp' => $otp
        ]);
    } else {
        // --- EMERGENCY FALLBACK (MODE DARURAT) ---
        // Jika SMS gagal (misal: device disconnect), berikan OTP lewat response 
        // agar pendaftaran tidak terhenti saat tahap testing.
        return $this->response->setJSON([
            'success'       => true,
            'message'       => 'Peringatan: WhatsApp/SMS Gateway sedang offline. Mengaktifkan Mode Simulasi.',
            'warning'       => 'Device Disconnected',
            'simulated_otp' => $otp
        ]);
    }
}


    // =====================
    // POST /auth/verify-password
    // =====================
    public function verifyPassword()
    {
        $data = $this->request->getJSON(true);
        $userId = $data['user_id'] ?? null;
        $password = $data['password'] ?? null;

        if (!$userId || !$password) {
            return $this->response->setStatusCode(400)->setJSON(['success' => false, 'message' => 'User ID dan Password wajib diisi']);
        }

        $user = $this->authModel->find($userId);
        if (!$user) return $this->response->setStatusCode(404)->setJSON(['success' => false, 'message' => 'User tidak ditemukan']);

        // Check password (support both plaintext for old data and hash)
        $valid = ($user['password'] === $password || password_verify($password, $user['password']));

        return $this->response->setJSON([
            'success' => $valid,
            'message' => $valid ? 'Password terverifikasi' : 'Password salah'
        ]);
    }

    // =====================
    // POST /auth/reset-password/request
    // =====================
    public function requestReset()
    {
        $data = $this->request->getJSON(true);
        $phone = $data['phone'] ?? null;

        if (!$phone) {
            return $this->response->setStatusCode(400)->setJSON(['success' => false, 'message' => 'Nomor HP wajib diisi']);
        }

        // Cari user berdasarkan phone
        $user = $this->authModel->getByIdentity($phone);
        if (!$user) {
            return $this->response->setStatusCode(404)->setJSON(['success' => false, 'message' => 'Nomor HP tidak terdaftar']);
        }

        $otp = rand(100000, 999999);
        $expiry = date('Y-m-d H:i:s', strtotime('+5 minutes'));

        // Simpan ke DB
        $userModel = new \App\Models\UserModel();
        $userModel->update($user['id'], [
            'reset_otp' => $otp,
            'reset_expiry' => $expiry
        ]);

        // Kirim via WhatsApp
        $smsService = new \App\Libraries\SmsService();
        $message = "[TheFourtyFour] KODE OTP Atur Ulang Sandi Anda adalah: $otp. Kode berlaku selama 5 menit. JANGAN BERIKAN KODE INI KE SIAPAPUN.";
        
        $result = $smsService->sendMessage($phone, $message);

        return $this->response->setJSON([
            'success' => true,
            'message' => 'OTP berhasil dikirim ke WhatsApp ' . $phone,
            'simulated_otp' => $otp // Hapus di production jika mau benar-benar aman
        ]);
    }

    // =====================
    // POST /auth/reset-password/verify
    // =====================
    public function commitReset()
    {
        $data = $this->request->getJSON(true);
        $phone = $data['phone'] ?? null;
        $otp = $data['otp'] ?? null;
        $newPassword = $data['password'] ?? null;

        if (!$phone || !$otp || !$newPassword) {
            return $this->response->setStatusCode(400)->setJSON(['success' => false, 'message' => 'Data tidak lengkap']);
        }

        $user = $this->authModel->getByIdentity($phone);
        if (!$user) return $this->response->setStatusCode(404)->setJSON(['success' => false, 'message' => 'User tidak ditemukan']);

        // Cek OTP dan Expiry
        $now = date('Y-m-d H:i:s');
        if ($user['reset_otp'] !== $otp || $now > $user['reset_expiry']) {
            return $this->response->setStatusCode(400)->setJSON(['success' => false, 'message' => 'Kode OTP salah atau sudah kadaluarsa']);
        }

        // Update Password dan Hapus OTP
        $userModel = new \App\Models\UserModel();
        $userModel->update($user['id'], [
            'password' => password_hash($newPassword, PASSWORD_DEFAULT),
            'reset_otp' => null,
            'reset_expiry' => null
        ]);

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Kata sandi berhasil diganti. Silakan login kembali.'
        ]);
    }

}
