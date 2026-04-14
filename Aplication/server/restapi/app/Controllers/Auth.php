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


}
