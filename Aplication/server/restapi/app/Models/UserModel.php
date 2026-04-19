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
        'password',
        'image',
        'reset_otp',
        'reset_expiry'
    ];

    protected $useTimestamps = false;

    // ================= GET ALL USER + MEMBER =================
    public function getAllUsers($limit = 10, $offset = 0, $search = '')
    {
        $builder = $this->db->table('users u')
            ->select('u.*, m.active_points, m.lifetime_points, m.membership_level')
            ->join('members m', 'm.user_id = u.id', 'left');

        if (!empty($search)) {
            $builder->groupStart()
                ->like('u.name', $search)
                ->orLike('u.username', $search)
                ->orLike('u.email', $search)
                ->groupEnd();
        }

        return $builder->orderBy('u.id', 'DESC')
            ->limit($limit, $offset)
            ->get()
            ->getResultArray();
    }

    public function countUsers($search = '')
    {
        $builder = $this->db->table('users u');
        if (!empty($search)) {
            $builder->groupStart()
                ->like('u.name', $search)
                ->orLike('u.username', $search)
                ->orLike('u.email', $search)
                ->groupEnd();
        }
        return $builder->countAllResults();
    }

    // ================= CREATE USER =================
    public function createUser($data)
    {
        $this->insert([
            'role_id' => $data['role_id'] ?? 3,
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'username' => $data['username'],
            'password' => password_hash($data['password'], PASSWORD_DEFAULT)
        ]);

        $userId = $this->getInsertID();

        // Generate Member ID (Contoh: MBR-20240415-001)
        $memberId = 'MBR-' . date('Ymd') . '-' . str_pad($userId, 3, '0', STR_PAD_LEFT);

        // INSERT MEMBER
        $this->db->table('members')->insert([
            'user_id' => $userId,
            'member_id' => $memberId,
            'active_points' => $data['active_points'] ?? 0,
            'lifetime_points' => $data['active_points'] ?? 0,
            'membership_level' => 'SILVER'
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
                    'active_points' => $data['active_points'] ?? 0,
                    'lifetime_points' => $data['lifetime_points'] ?? 0
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
