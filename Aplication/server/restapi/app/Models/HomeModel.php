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
                u.username,
                u.image,
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

    // BANNER AKTIF
    public function getActiveBanners()
    {
        return $this->db->table('banners')
            ->select('id, title, image')
            ->where('is_active', 1)
            ->orderBy('id', 'DESC')
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

public function getPointLedger($userId)
    {
        // 1. Ambil Member ID & Total Poin
        $member = $this->db->table('members')
            ->select('id, active_points')
            ->where('user_id', $userId)
            ->get()
            ->getRowArray();

        if (!$member) {
            return [
                'total_points' => 0,
                'history' => []
            ];
        }

        $memberId = $member['id'];

        // 2. Ambil History dari Ledger
        // Join ke transactions untuk dapetin invoice_code (tapi hanya jika points_earned > 0)
        $history = $this->db->table('member_point_ledger l')
            ->select('
                l.id,
                t.invoice_code,
                (l.points_earned - l.points_used) as points,
                l.status,
                l.expiry_date as expired_at,
                l.earned_date as created_at
            ')
            ->join('transactions t', 't.id = l.transaction_id', 'left')
            ->where('l.member_id', $memberId)
            ->orderBy('l.id', 'DESC')
            ->get()
            ->getResultArray();

        // Bersihkan invoice_code jika null (untuk redemption)
        foreach ($history as &$h) {
            if (!$h['invoice_code']) {
                $h['invoice_code'] = ($h['points'] < 0) ? 'REDEMPTION' : 'SYSTEM';
            }
        }

        return [
            'total_points' => (int)$member['active_points'],
            'history'      => $history
        ];
    }
}
