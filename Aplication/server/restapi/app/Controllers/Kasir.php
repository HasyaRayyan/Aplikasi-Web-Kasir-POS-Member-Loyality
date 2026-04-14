<?php

namespace App\Controllers;

use App\Models\ProductModel;
use App\Models\KasirModel;
use App\Models\RedemptionModel;

use CodeIgniter\RESTful\ResourceController;

class Kasir extends ResourceController
{
    protected $productModel;
    protected $kasirModel;
    protected $redemptionModel;
    protected $db;

    public function __construct()
    {
        $this->productModel = new ProductModel();
        $this->kasirModel = new KasirModel();
        $this->redemptionModel = new RedemptionModel();
        $this->db = \Config\Database::connect();
    }

public function index()
{
    $search   = $this->request->getGet('search');
    $category = $this->request->getGet('category');
    $page     = $this->request->getGet('page') ?? 1;
    $limit    = $this->request->getGet('limit') ?? 9;

    $result = $this->productModel->getKasirProducts(
        $search,
        $category,
        $limit,
        $page
    );

    return $this->respond([
        'status' => true,
        'products' => $result['data'],
        'meta' => [
            'total' => $result['total'],
            'total_pages' => $result['total_pages'],
            'page' => $page
        ],
        'categories' => $this->productModel->getCategories()
    ]);
}


// ================= GET MEMBER BY PHONE =================
public function memberByPhone()
{
    $phone = $this->request->getGet('phone');

    if (!$phone) {
        return $this->respond([
            'status' => false,
            'message' => 'Nomor telepon kosong'
        ]);
    }

    $member = $this->kasirModel->getMemberByPhone($phone);

    if (!$member) {
        return $this->respond([
            'status' => false,
            'message' => 'Member tidak ditemukan'
        ]);
    }

    // AMBIL REDEMPTIONS
    $redemptions = $this->redemptionModel->getPendingRedemptions($phone);

    return $this->respond([
        'status' => true,
        'data' => $member,
        'redemptions' => $redemptions
    ]);
}

// ================= CLAIM REDEMPTION =================
public function claimRedemption($id = null)
{
    if (!$id) {
        return $this->respond([
            'status' => false,
            'message' => 'ID tidak valid'
        ]);
    }

    $result = $this->redemptionModel->claim($id);

    return $this->respond([
        'status' => $result,
        'message' => $result ? 'Berhasil diklaim' : 'Gagal klaim'
    ]);
}





public function transaction()
{
    $data = $this->request->getJSON(true);

    $cart          = $data['cart'];
    $total         = $data['total'];
    $memberId      = $data['member_id'] ?? null;
    $customerName  = $data['customer_name'] ?? 'Umum';
    $paymentMethod = $data['payment_method'] ?? 'cash';
    $cashPaid      = $data['cash_paid'] ?? 0;
    $changeMoney   = $data['change_money'] ?? 0;

    $result = $this->kasirModel->processTransaction(
        $cart,
        $total,
        $memberId,
        $customerName,
        $paymentMethod,
        $cashPaid,
        $changeMoney
    );

    return $this->respond($result);
}


public function getHistory()
{
    $page   = $this->request->getGet('page') ?? 1;
    $search = $this->request->getGet('search') ?? '';
    
    // Explicitly set limit to 10
    $limit  = 10;

    $result = $this->kasirModel->getTransactionHistory($page, $limit, $search);

    return $this->response->setJSON([
        'status' => true,
        'data'   => $result['data'],
        'meta'   => $result['meta']
    ]);
}




}
