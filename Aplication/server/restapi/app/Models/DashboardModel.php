<?php

namespace App\Models;

use CodeIgniter\Model;

class DashboardModel extends Model
{
    protected $DBGroup = 'default';

    // ================= METRICS HARI INI =================
    public function getTodayMetrics()
    {
        $today = date('Y-m-d');

        // transaksi hari ini
        $trx = $this->db->table('transactions')
            ->where('DATE(created_at)', $today)
            ->countAllResults();

        // omzet hari ini
        $omzet = $this->db->table('transactions')
            ->selectSum('total_price')
            ->where('DATE(created_at)', $today)
            ->get()
            ->getRow()
            ->total_price ?? 0;

        // produk terjual hari ini
        $products = $this->db->table('transaction_items ti')
            ->selectSum('ti.qty')
            ->join('transactions t', 't.id = ti.transaction_id')
            ->where('DATE(t.created_at)', $today)
            ->get()
            ->getRow()
            ->qty ?? 0;

        // member datang hari ini
        $members = $this->db->table('transactions')
            ->where('DATE(created_at)', $today)
            ->where('user_id IS NOT NULL')
            ->countAllResults();

        return [
            'transactions' => (int)$trx,
            'revenue' => (float)$omzet,
            'products' => (int)$products,
            'members' => (int)$members
        ];
    }

    // ================= CHART 7 HARI =================
    public function getWeeklyChart()
    {
        $result = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));

            $count = $this->db->table('transactions')
                ->where('DATE(created_at)', $date)
                ->countAllResults();

            $result[] = $count;
        }

        return $result;
    }

    // ================= PRODUK TERLARIS =================
    public function getBestProducts()
    {
        return $this->db->table('transaction_items ti')
            ->select('ti.product_name, ti.price, SUM(ti.qty) as total_sold')
            ->groupBy('ti.product_id')
            ->orderBy('total_sold', 'DESC')
            ->limit(5)
            ->get()
            ->getResultArray();
    }

    // ================= TRANSAKSI TERBARU =================
    public function getRecentTransactions()
    {
        return $this->db->table('transactions')
            ->orderBy('created_at', 'DESC')
            ->limit(5)
            ->get()
            ->getResultArray();
    }
}
