<?php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table = 'users';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'role_id',
        'name',
        'email',
        'phone',
        'username',
        'password'
    ];

    protected $useTimestamps = false;

    // ================= GET ALL USER + MEMBER =================
    public function getAllUsers()
    {
        return $this->db->table('users u')
            ->select('u.*, m.total_points, m.membership_level')
            ->join('members m', 'm.user_id = u.id', 'left')
            ->orderBy('u.id', 'DESC')
            ->get()
            ->getResultArray();
    }

    // ================= CREATE USER =================
    public function createUser($data)
    {
        $this->insert([
            'role_id' => $data['role_id'] ?? 2,
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'username' => $data['username'],
            'password' => password_hash($data['password'], PASSWORD_DEFAULT)
        ]);

        $userId = $this->getInsertID();

        // INSERT MEMBER
        $this->db->table('members')->insert([
            'user_id' => $userId,
            'total_points' => $data['total_points'] ?? 0,
            'membership_level' => 'Basic'
        ]);

        return $userId;
    }

    // ================= UPDATE USER =================
    public function updateUser($id, $data)
    {
        $userData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'username' => $data['username']
        ];

        if (!empty($data['password'])) {
            $userData['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }

        $this->update($id, $userData);

        // UPDATE MEMBER POINT
        $member = $this->db->table('members')
            ->where('user_id', $id)
            ->get()
            ->getRowArray();

        if ($member) {
            $this->db->table('members')
                ->where('user_id', $id)
                ->update([
                    'total_points' => $data['total_points'] ?? 0
                ]);
        }
    }

    // ================= DELETE USER =================
    public function deleteUser($id)
    {
        $this->db->table('members')->where('user_id', $id)->delete();
        $this->delete($id);
    }

    // ================= GET ROLES =================
    public function getRoles()
    {
        return $this->db->table('roles')
            ->select('id, name')
            ->orderBy('id', 'ASC')
            ->get()
            ->getResultArray();
    }

}
