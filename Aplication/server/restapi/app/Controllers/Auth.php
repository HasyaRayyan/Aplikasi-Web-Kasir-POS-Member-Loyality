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
        $data = $this->request->getJSON();

        $username = $data->username ?? null;
        $password = $data->password ?? null;

        if (!$username || !$password) {
            return $this->response->setStatusCode(400)->setJSON([
                'success' => false,
                'message' => 'Username dan password wajib diisi'
            ]);
        }

        $user = $this->authModel->getByUsername($username);

        if (!$user) {
            return $this->response->setStatusCode(404)->setJSON([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ]);
        }

        // ⚠️ sementara plaintext (TA)
        if ($password !== $user['password']) {
            return $this->response->setStatusCode(401)->setJSON([
                'success' => false,
                'message' => 'Password salah'
            ]);
        }

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'id'       => $user['id'],
                'name'     => $user['name'],
                'username' => $user['username'],
                'role_id'  => $user['role_id'], // 1=admin,2=kasir,3=member
            ]
        ]);
    }
}
