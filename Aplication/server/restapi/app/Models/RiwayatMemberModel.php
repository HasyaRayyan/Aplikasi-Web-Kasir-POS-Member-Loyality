<?php

namespace App\Models;
use CodeIgniter\Model;

class RiwayatMemberModel extends Model
{
    protected $DBGroup = 'default';

    /* ================= MEMBER ID ================= */
    public function getMemberIdByUser($userId)
    {
        $row = $this->db->table('members')
            ->select('id')
            ->where('user_id', $userId)
            ->get()
            ->getRowArray();

        return $row['id'] ?? null;
    }

    /* ================= TRANSAKSI LIST ================= */
    public function getTransactions($memberId)
    {
        return $this->db->table('transactions')
            ->select('
                id,
                invoice_code,
                customer_name,
                total_price,
                total_point,
                payment_method,
                created_at,
                cash_paid,
                change_money
            ')
            ->where('user_id', $memberId) // user_id = member_id
            ->orderBy('created_at', 'DESC')
            ->get()
            ->getResultArray();
    }

    /* ================= ITEMS ================= */
    public function getItems($transactionId)
    {
        return $this->db->table('transaction_items')
            ->select('
                id,
                product_id,
                product_name,
                price,
                qty,
                subtotal
            ')
            ->where('transaction_id', $transactionId)
            ->get()
            ->getResultArray();
    }

    /* ================= ADDONS ================= */
    public function getAddons($itemId)
    {
        return $this->db->table('transaction_item_addons')
            ->select('
                id,
                addon_name,
                addon_price
            ')
            ->where('transaction_item_id', $itemId)
            ->get()
            ->getResultArray();
    }
}
