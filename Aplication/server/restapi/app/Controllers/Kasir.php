<?php

namespace App\Controllers;

use App\Models\ProductModel;
use App\Models\KasirModel;

use CodeIgniter\RESTful\ResourceController;

class Kasir extends ResourceController
{
    protected $productModel;
    protected $kasirModel;

    public function __construct()
    {
        $this->productModel = new ProductModel();
        $this->kasirModel = new KasirModel();
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

    return $this->respond([
        'status' => true,
        'data' => $member
    ]);
}

}
