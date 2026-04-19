<?php

namespace App\Models;

use CodeIgniter\Model;

class PointMemberModel extends Model
{
    protected $db;

    public function __construct()
    {
        parent::__construct();
        $this->db = \Config\Database::connect();
    }

    /**
     * Mengambil data dasar member berdasarkan user_id
     */
    public function getMemberData($userId)
    {
        return $this->db->table('members')
            ->where('user_id', $userId)
            ->get()
            ->getRowArray();
    }

    /**
     * Mengambil riwayat perolehan poin (Ledger)
     */
    public function getLedgerHistory($memberId)
    {
        return $this->db->table('member_point_ledger l')
            ->select('
                l.id,
                t.invoice_code,
                l.points_earned,
                l.points_used,
                (l.points_earned - l.points_used) as points_remaining,
                l.earned_date,
                l.expiry_date,
                l.status
            ')
            ->join('transactions t', 't.id = l.transaction_id', 'left')
            ->where('l.member_id', $memberId)
            ->orderBy('l.earned_date', 'DESC')
            ->get()
            ->getResultArray();
    }

    /**
     * Mengambil riwayat penukaran poin (Redemptions)
     */
    public function getRedemptionHistory($memberId)
    {
        return $this->db->table('point_redemptions r')
            ->select('
                r.id,
                p.product_name,
                r.points_used,
                r.status,
                r.redeemed_at,
                r.claimed_at,
                r.redemption_code
            ')
            ->join('products p', 'p.id = r.product_id', 'left')
            ->where('r.member_id', $memberId)
            ->orderBy('r.redeemed_at', 'DESC')
            ->get()
            ->getResultArray();
    }
}
