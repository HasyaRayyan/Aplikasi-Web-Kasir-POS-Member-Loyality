<?php

namespace App\Controllers;

use App\Models\RedemptionModel;
use App\Models\HomeModel;
use CodeIgniter\RESTful\ResourceController;

class RedemptionController extends ResourceController
{
    protected $redemptionModel;

    public function __construct()
    {
        $this->redemptionModel = new RedemptionModel();
    }

    public function redeem()
    {
        $data = $this->request->getJSON(true);
        $userId    = $data['user_id'] ?? null;
        $productId = $data['product_id'] ?? null;

        if (!$userId || !$productId) {
            return $this->respond([
                'status'  => false,
                'message' => 'Data tidak lengkap'
            ], 400);
        }

        $result = $this->redemptionModel->redeem($userId, $productId);

        return $this->respond($result);
    }

    public function getExchangeableProducts()
    {
        $products = $this->redemptionModel->getExchangeableProducts(100);

        return $this->respond([
            'status' => true,
            'data'   => $products
        ]);
    }

    public function history($userId)
    {
        $history = $this->redemptionModel->getMemberRedemptions($userId);
        return $this->respond([
            'status' => true,
            'data'   => $history
        ]);
    }
}
