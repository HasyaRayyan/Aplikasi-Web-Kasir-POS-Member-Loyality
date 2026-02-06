<?php

namespace App\Models;

use CodeIgniter\Model;

class KasirModel extends Model
{
    protected $db;

    public function __construct()
    {
        parent::__construct();
        $this->db = \Config\Database::connect();
    }

    // ================= GET MEMBER BY PHONE =================
    public function getMemberByPhone($phone)
    {
        return $this->db->table('users u')
            ->select('
                u.id as user_id,
                u.name,
                u.phone,
                m.id as member_id,
                m.total_points,
                m.membership_level
            ')
            ->join('members m', 'm.user_id = u.id', 'left')
            ->where('u.phone', $phone)
            ->get()
            ->getRowArray();
    }
}
