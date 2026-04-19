<?php

namespace App\Models;

use CodeIgniter\Model;

class RedemptionModel extends Model
{
    protected $db;

    public function __construct()
    {
        parent::__construct();
        $this->db = \Config\Database::connect();
    }

    /* ================= REDEEM PRODUCT ================= */
    public function redeem($userId, $productId)
    {
        $this->db->transStart();

        // 1. Dapatkan Member Data
        $member = $this->db->table('members')
            ->where('user_id', $userId)
            ->get()
            ->getRowArray();

        if (!$member) return ['success' => false, 'message' => 'Member tidak ditemukan'];

        $memberId = $member['id'];

        // 2. Dapatkan Product Data
        $product = $this->db->table('products')
            ->where('id', $productId)
            ->where('is_exchangeable', 1)
            ->where('point_price >', 0)
            ->get()
            ->getRowArray();

        if (!$product) return ['success' => false, 'message' => 'Produk tidak dapat ditukar poin'];
        if ($product['qty'] <= 0) return ['success' => false, 'message' => 'Stok produk habis'];

        $pointPrice = (int)$product['point_price'];

        // 3. Cek Poin Cukup?
        if ($member['active_points'] < $pointPrice) {
            return ['success' => false, 'message' => 'Poin tidak cukup'];
        }

        // 4. Potong Poin Member
        $this->db->query("
            UPDATE members 
            SET active_points = active_points - ? 
            WHERE id = ?
        ", [$pointPrice, $memberId]);

        // 5. Kurangi Stok Produk
        $this->db->query("
            UPDATE products 
            SET qty = qty - 1 
            WHERE id = ?
        ", [$productId]);

        // 6. Buat Record Redemption
        $redeemedAt = date('Y-m-d H:i:s');
        $expiredAt  = date('Y-m-d H:i:s', strtotime('+48 hours')); // Default 2 hari
        $code       = 'RED-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));

        $this->db->table('point_redemptions')->insert([
            'member_id'       => $memberId,
            'product_id'      => $productId,
            'points_used'     => $pointPrice,
            'status'          => 'pending',
            'redeemed_at'     => $redeemedAt,
            'expired_at'      => $expiredAt,
            'redemption_code' => $code
        ]);

        // 7. Catat di Ledger (Penggunaan Poin)
        $this->db->table('member_point_ledger')->insert([
            'member_id'      => $memberId,
            'points_earned'  => 0,
            'points_used'    => $pointPrice,
            'earned_date'    => date('Y-m-d H:i:s'),
            'expiry_date'    => date('Y-m-d H:i:s'), // Tanggal hari ini saja
            'status'         => 'used'
        ]);

        $this->db->transComplete();

        if ($this->db->transStatus() === FALSE) {
            return ['success' => false, 'message' => 'Gagal memproses transaksi'];
        }

        return [
            'success' => true,
            'message' => 'Berhasil ditukarkan!',
            'code'    => $code
        ];
    }

    /* ================= GET EXCHANGEABLE PRODUCTS (FOR MEMBER APP) ================= */
    public function getExchangeableProducts($limit = 50)
    {
        return $this->db->table('products')
            ->select('id, product_name, image, price, point_price, is_exchangeable')
            ->where('is_active', 1)
            ->where('is_exchangeable', 1)
            ->limit($limit)
            ->get()
            ->getResultArray();
    }

    /* ================= GET PENDING REDEMPTIONS BY PHONE ================= */
    public function getPendingRedemptions($phone)
    {
        // Cari user by phone
        $user = $this->db->table('users u')
            ->select('m.id as member_id')
            ->join('members m', 'm.user_id = u.id')
            ->where('u.phone', $phone)
            ->get()
            ->getRowArray();

        if (!$user) return [];

        $memberId = $user['member_id'];

        return $this->db->table('point_redemptions pr')
            ->select('
                pr.id,
                pr.product_id,
                p.product_name,
                pr.points_used,
                pr.redeemed_at,
                pr.expired_at,
                pr.redemption_code
            ')
            ->join('products p', 'p.id = pr.product_id')
            ->where('pr.member_id', $memberId)
            ->where('pr.status', 'pending')
            ->where('pr.expired_at >', date('Y-m-d H:i:s'))
            ->get()
            ->getResultArray();
    }

    /* ================= GET MEMBER REDEMPTIONS (FOR MEMBER APP) ================= */
    public function getMemberRedemptions($userId)
    {
        $member = $this->db->table('members')
            ->where('user_id', $userId)
            ->get()
            ->getRowArray();

        if (!$member) return [];

        return $this->db->table('point_redemptions pr')
            ->select('
                pr.id,
                pr.product_id,
                p.product_name,
                p.image,
                pr.points_used,
                pr.status,
                pr.redeemed_at,
                pr.claimed_at,
                pr.expired_at,
                pr.redemption_code
            ')
            ->join('products p', 'p.id = pr.product_id')
            ->where('pr.member_id', $member['id'])
            ->orderBy('pr.redeemed_at', 'DESC')
            ->get()
            ->getResultArray();
    }

    /* ================= CLAIM REDEMPTION ================= */
    public function claim($id)
    {
        return $this->db->table('point_redemptions')
            ->where('id', $id)
            ->where('status', 'pending')
            ->update([
                'status'     => 'claimed',
                'claimed_at' => date('Y-m-d H:i:s')
            ]);
    }

    /* ================= EXPIRE OLD REDEMPTIONS ================= */
    public function autoExpire()
    {
        return $this->db->table('point_redemptions')
            ->where('status', 'pending')
            ->where('expired_at <=', date('Y-m-d H:i:s'))
            ->update(['status' => 'expired']);
    }
}
