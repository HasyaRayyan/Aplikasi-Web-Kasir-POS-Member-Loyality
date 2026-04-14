<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use App\Models\ProfileMemberModel;

class ProfileMember extends BaseController
{
    protected $model;

    public function __construct()
    {
        $this->model = new ProfileMemberModel();
    }

    /* ================= GET PROFILE ================= */
    public function index($userId)
    {
        $user = $this->model->getProfile($userId);

        if (!$user) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'User tidak ditemukan'
            ]);
        }

        return $this->response->setJSON([
            'status' => true,
            'data' => $user
        ]);
    }

    /* ================= UPDATE PROFILE ================= */
    public function update($userId)
    {
        $input = $this->request->getJSON(true);

        if (!$input) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'No data received'
            ]);
        }

        $data = [
            'name'     => $input['name'] ?? null,
            'email'    => $input['email'] ?? null,
            'phone'    => $input['phone'] ?? null,
            'username' => $input['username'] ?? null, // ⬅️ WAJIB
        ];

        $updated = $this->model->updateProfile($userId, $data);

        return $this->response->setJSON([
            'status' => $updated ? true : false,
            'message' => $updated ? 'Profile berhasil diperbarui' : 'Gagal update'
        ]);
    }


    /* ================= CHANGE PASSWORD ================= */
public function changePassword($userId)
{
    $input = $this->request->getJSON(true);

    $old = $input['old_password'] ?? '';
    $new = $input['new_password'] ?? '';

    if (!$old || !$new) {
        return $this->response->setJSON([
            'status' => false,
            'message' => 'Password kosong'
        ]);
    }

    $user = $this->model->find($userId);

    if (!$user) {
        return $this->response->setJSON([
            'status' => false,
            'message' => 'User tidak ditemukan'
        ]);
    }

    // SUPPORT PASSWORD LAMA NON HASH
    if ($user['password'] === $old || password_verify($old, $user['password'])) {

        $hashed = password_hash($new, PASSWORD_DEFAULT);
        $this->model->updatePassword($userId, $hashed);

        return $this->response->setJSON([
            'status' => true,
            'message' => 'Password berhasil diganti'
        ]);
    }

    return $this->response->setJSON([
        'status' => false,
        'message' => 'Password lama salah'
    ]);
}

}
