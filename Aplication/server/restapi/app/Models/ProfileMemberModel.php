<?php

namespace App\Models;
use CodeIgniter\Model;

class ProfileMemberModel extends Model
{
    protected $table = 'users';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'name','email','phone','username','password'
    ];

    /* ================= GET PROFILE ================= */
    public function getProfile($userId)
    {
        return $this->select('id, name, email, phone, username, created_at')
            ->where('id', $userId)
            ->first();
    }

    /* ================= UPDATE PROFILE ================= */
    public function updateProfile($userId, $data)
    {
        return $this->update($userId, $data);
    }

    /* ================= UPDATE PASSWORD ================= */
    public function updatePassword($userId, $hashedPassword)
    {
        return $this->update($userId, [
            'password' => $hashedPassword
        ]);
    }
}
