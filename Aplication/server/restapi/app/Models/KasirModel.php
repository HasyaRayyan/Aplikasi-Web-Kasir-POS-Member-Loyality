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
                m.lifetime_points, 
                m.active_points,   
                m.membership_level
            ') // <-- UBAH: ganti total_points jadi lifetime_points & active_points
            ->join('members m', 'm.user_id = u.id', 'left')
            ->where('u.phone', $phone)
            ->get()
            ->getRowArray();
    }

    public function processTransaction($cart, $total, $memberId, $customerName, $paymentMethod, $cashPaid = 0, $changeMoney = 0)
    {
        $this->db->transStart();

        // ================= INSERT HEADER =================
        $this->db->table('transactions')->insert([
            'invoice_code'  => $this->generateInvoiceCode(),
            'user_id'       => $memberId ? $memberId : null,
            'customer_name' => $customerName,
            'total_price'   => $total,
            'payment_method'=> $paymentMethod,
            'cash_paid'     => $cashPaid,
            'change_money'  => $changeMoney,
            'total_point'   => 0
        ]);

        $trxId = $this->db->insertID();

        // ================= LOOP CART =================
        foreach ($cart as $c) {

            $productId = (int)$c['id'];
            $qty       = (int)$c['qty'];
            $price     = (float)$c['price'];
            $subtotal  = (float)$c['subtotal'];
            $isRedeem  = isset($c['is_redemption']) && $c['is_redemption'];

            // INSERT ITEM
            $this->db->table('transaction_items')->insert([
                'transaction_id' => $trxId,
                'product_id'     => $productId,
                'product_name'   => $c['product_name'],
                'price'          => $price,
                'qty'            => $qty,
                'subtotal'       => $subtotal
            ]);

            $itemId = $this->db->insertID();

            // Jika ini barang REDEEM: 
            // 1. Lewati potong stok (sudah dipotong saat redeem di aplikasi)
            // 2. Tandai status redeem menjadi claimed
            if ($isRedeem) {
                $redemptionId = $c['redemption_id'];
                $this->db->table('point_redemptions')
                    ->where('id', $redemptionId)
                    ->update([
                        'status'     => 'claimed',
                        'claimed_at' => date('Y-m-d H:i:s')
                    ]);
            } else {
                // ================= KURANGI STOK PRODUK =================
                $this->db->query("
                    UPDATE products
                    SET qty = qty - ?
                    WHERE id = ?
                ", [$qty, $productId]);
            }

            // ================= ADDON =================
            if (!empty($c['selectedAddons']) && !$isRedeem) {
                foreach ($c['selectedAddons'] as $a) {

                    $addonId    = (int)$a['id'];
                    $addonName  = $a['addon_name'];
                    $addonPrice = (float)$a['addon_price'];

                    // INSERT ADDON
                    $this->db->table('transaction_item_addons')->insert([
                        'transaction_item_id' => $itemId,
                        'addon_id'            => $addonId,
                        'addon_name'          => $addonName,
                        'addon_price'         => $addonPrice
                    ]);

                    // KURANGI STOK ADDON
                    $this->db->query("
                        UPDATE product_addons
                        SET qty = qty - ?
                        WHERE id = ?
                    ", [$qty, $addonId]);
                }
            }
        }

        // ================= POINT (DIUBAH SESUAI SQL BARU) =================
        $point = 0;

        if ($memberId) {
            
            // 1. Cek apakah ada PROMO EVENT yang sedang aktif hari ini
            $rule = $this->db->table('point_rules')
                ->where('is_active', 1)
                ->where('is_default', 0) // <-- Pastikan ini bukan yang default
                ->where('start_date <=', date('Y-m-d'))
                ->where('end_date >=', date('Y-m-d'))
                ->orderBy('id', 'DESC')
                ->get()
                ->getRowArray();

            // 2. Jika TIDAK ADA event aktif, gunakan POINT DEFAULT
            if (!$rule) {
                $rule = $this->db->table('point_rules')
                    ->where('is_active', 1)
                    ->where('is_default', 1) // <-- Ambil yang default
                    ->get()
                    ->getRowArray();
            }

            if ($rule) {
                $amount = (int)$rule['amount_per_point'];
                $value  = (int)$rule['point_value'];

                if ($amount > 0) {
                    $multiplier = floor($total / $amount);
                    $point = $multiplier * $value;
                }

                // ... (lanjutan kode insert point ke members & ledger tetap sama seperti sebelumnya) ...
                if ($point > 0) {
                    // 1. UPDATE MEMBER POINT
                    $this->db->query("
                        UPDATE members
                        SET lifetime_points = lifetime_points + ?,
                            active_points = active_points + ?
                        WHERE id = ?
                    ", [$point, $point, $memberId]);

                    // 2. INSERT KE MEMBER POINT LEDGER (masa berlaku 1 tahun)
                    $earned_date = date('Y-m-d H:i:s');
                    $expiry_date = date('Y-m-d H:i:s', strtotime('+1 year'));

                    $this->db->table('member_point_ledger')->insert([
                        'member_id'      => $memberId,
                        'transaction_id' => $trxId,
                        'points_earned'  => $point,
                        'points_used'    => 0,
                        'earned_date'    => $earned_date,
                        'expiry_date'    => $expiry_date,
                        'status'         => 'active'
                    ]);

                    // 3. UPDATE POINT DI TRANSAKSI
                    $this->db->table('transactions')
                        ->where('id', $trxId)
                        ->update([
                            'total_point' => $point
                        ]);
                }
            }
        }

        $this->db->transComplete();

        return [
            'status'  => $this->db->transStatus(),
            'point'   => $point,
            'trx_id'  => $trxId
        ];
    }

    private function generateInvoiceCode()
    {
        $last = $this->db->table('transactions')
            ->select('id')
            ->orderBy('id', 'DESC')
            ->limit(1)
            ->get()
            ->getRowArray();

        $nextId = $last ? $last['id'] + 1 : 1;
        $number = str_pad($nextId, 8, '0', STR_PAD_LEFT);

        return 'INV-' . $number;
    }

    public function getTransactionHistory($page = 1, $limit = 20, $search = '')
    {
        $offset = ($page - 1) * $limit;
        $builder = $this->db->table('transactions t');

        if (!empty($search)) {
            $builder->groupStart()
                ->like('t.invoice_code', $search)
                ->orLike('t.customer_name', $search)
                ->groupEnd();
        }

        $totalData = $builder->countAllResults(false);

        $transactions = $builder
            ->select('t.*')
            ->orderBy('t.created_at', 'DESC')
            ->limit($limit, $offset)
            ->get()
            ->getResultArray();

        foreach ($transactions as &$trx) {
            $items = $this->db->table('transaction_items ti')
                ->where('ti.transaction_id', $trx['id'])
                ->get()
                ->getResultArray();

            foreach ($items as &$item) {
                $addons = $this->db->table('transaction_item_addons ta')
                    ->select('addon_name, addon_price')
                    ->where('transaction_item_id', $item['id'])
                    ->get()
                    ->getResultArray();

                $item['addons'] = $addons;
            }

            $trx['items'] = $items;
        }

        return [
            'data' => $transactions,
            'meta' => [
                'page' => (int)$page,
                'limit' => (int)$limit,
                'total_data' => $totalData,
                'total_pages' => ceil($totalData / $limit)
            ]
        ];
    }
}