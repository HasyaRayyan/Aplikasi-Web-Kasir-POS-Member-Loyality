<?php

namespace App\Controllers;

use App\Models\ProductModel;
use CodeIgniter\RESTful\ResourceController;

class Kasir extends ResourceController
{
    protected $productModel;

    public function __construct()
    {
        $this->productModel = new ProductModel();
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

}
