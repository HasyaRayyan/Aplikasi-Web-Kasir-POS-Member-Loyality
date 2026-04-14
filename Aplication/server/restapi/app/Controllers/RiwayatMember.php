<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use App\Models\RiwayatMemberModel;

class RiwayatMember extends BaseController
{
    protected $model;

    public function __construct()
    {
        $this->model = new RiwayatMemberModel();
    }

    public function index($userId)
    {
        try {

            // 1. CARI MEMBER ID
            $memberId = $this->model->getMemberIdByUser($userId);

            if (!$memberId) {
                return $this->response->setJSON([
                    'status' => false,
                    'message' => 'Member tidak ditemukan'
                ]);
            }

            // 2. AMBIL TRANSAKSI
            $transactions = $this->model->getTransactions($memberId);

            // 3. LOOP DETAIL
            foreach ($transactions as &$trx) {

                $items = $this->model->getItems($trx['id']);

                foreach ($items as &$item) {
                    $item['addons'] = $this->model->getAddons($item['id']);
                }

                $trx['items'] = $items;
            }

            return $this->response->setJSON([
                'status' => true,
                'data' => $transactions
            ]);

        } catch (\Throwable $e) {

            return $this->response->setJSON([
                'status' => false,
                'error' => $e->getMessage()
            ]);
        }
    }
}
