<?php

namespace App\Models;
use CodeIgniter\Model;

class HomeModel extends Model
{
    protected $DBGroup = 'default';

    // USER + MEMBER
    public function getUserMember($userId)
    {
        return $this->db->table('users u')
            ->select('
                u.id,
                u.name,
                u.email,
                u.phone,
                m.id as id_member_tbl, 
                m.member_id,
                m.lifetime_points,
                m.active_points,
                m.membership_level
            ')
            ->join('members m', 'm.user_id = u.id', 'left')
            ->where('u.id', $userId)
            ->get()
            ->getRowArray();
    }

    // TRANSAKSI TERAKHIR
    public function getRecentTransactions($userId, $limit = 5)
    {
        return $this->db->table('transactions')
            ->select('id, invoice_code, total_price, total_point, payment_method, created_at')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'DESC')
            ->limit($limit)
            ->get()
            ->getResultArray();
    }

    // PRODUK AKTIF
    public function getActiveProducts($limit = 6)
    {
        return $this->db->table('products')
            ->select('id, product_name, image, price, point_price, is_exchangeable')
            ->where('is_active', 1)
            ->limit($limit)
            ->get()
            ->getResultArray();
    }


public function getRecentActivityByMember($userId, $limit = 3)
{
    // 1. AMBIL MEMBER ID DULU
    $member = $this->db->table('members')
        ->select('id')
        ->where('user_id', $userId)
        ->get()
        ->getRowArray();

    // JIKA BELUM PUNYA MEMBER
    if (!$member || !isset($member['id'])) {
        return [];
    }

    $memberId = $member['id'];

    // 2. AMBIL TRANSAKSI
    // CATATAN: transactions.user_id = members.id
    return $this->db->table('transactions')
        ->select('
            id,
            invoice_code,
            total_price,
            total_point,
            payment_method,
            created_at
        ')
        ->where('user_id', $memberId) // ⬅️ INI YANG BENAR
        ->orderBy('created_at', 'DESC')
        ->limit($limit)
        ->get()
        ->getResultArray();
}

}
