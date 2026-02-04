<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\ProductModel;

class ProductController extends ResourceController
{
    protected $format = 'json';

 public function index()
{
    $productModel = new ProductModel();

    $page   = (int) ($this->request->getGet('page') ?? 1);
    $limit  = (int) ($this->request->getGet('limit') ?? 10);
    $search = $this->request->getGet('search') ?? '';

    $offset = ($page - 1) * $limit;

    // TOTAL
    $total = $productModel->countProducts($search);

    // DATA
    $rows = $productModel->getProductsWithAddons($limit, $offset, $search);

    $products = [];

    foreach ($rows as $r) {
        $pid = $r['id'];

        if (!isset($products[$pid])) {
            $products[$pid] = [
                'id'            => $r['id'],
                'product_code'  => $r['product_code'],
                'product_name'  => $r['product_name'],
                'image'         => $r['image'],
                'price'         => $r['price'],
                'qty'           => $r['qty'],
                'is_active'     => $r['is_active'],

                // ⬇️ TAMBAHAN KATEGORI
                'category_id'   => $r['category_id'],
                'category_name' => $r['category_name'],

                'addons'        => []
            ];

        }

        if ($r['addon_id']) {
            $products[$pid]['addons'][] = [
                'id' => $r['addon_id'],
                'addon_name' => $r['addon_name'],
                'addon_price' => $r['addon_price'],
                'qty' => $r['addon_qty']
            ];
        }
    }

    return $this->respond([
        'success' => true,
        'message' => 'Berhasil mengambil data produk',
        'data' => array_values($products),
        'meta' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'total_pages' => ceil($total / $limit)
        ]
    ]);
}


public function addons()
{
    $model = new ProductModel();

    $page   = (int) ($this->request->getGet('page') ?? 1);
    $limit  = (int) ($this->request->getGet('limit') ?? 10);
    $search = $this->request->getGet('search') ?? '';

    $offset = ($page - 1) * $limit;

    $total = $model->countAddons($search);
    $data  = $model->getAddons($limit, $offset, $search);

    return $this->respond([
        'success' => true,
        'message' => 'Berhasil mengambil data addon',
        'data' => $data,
        'meta' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'total_pages' => ceil($total / $limit)
        ]
    ]);
}


public function create()
{
    $model = new ProductModel();

    // HANDLE IMAGE
    $image = $this->request->getFile('image');
    $imageName = null;

    if ($image && $image->isValid() && !$image->hasMoved()) {
        $imageName = $image->getRandomName();
        $image->move('uploads/products/', $imageName);
    }

        $productCode = $this->request->getPost('product_code');

    // kalau kosong → generate
    if (!$productCode || $productCode === '') {
        $productCode = $model->generateProductCode();
    }

    // DATA FORM
    $data = [
        'product_code' => $productCode,
        'category_id'  => $this->request->getPost('category_id'),
        'product_name' => $this->request->getPost('product_name'),
        'image'        => $imageName,
        'price'        => $this->request->getPost('price'),
        'qty'          => $this->request->getPost('qty'),
        'is_active'    => $this->request->getPost('is_active')
    ];

    $model->createProduct($data);

    return $this->respond([
        'success' => true,
        'message' => 'Produk berhasil ditambahkan'
    ]);
}

public function categories()
{
    $model = new ProductModel();

    $data = $model->getCategories();

    return $this->respond([
        'success' => true,
        'message' => 'Berhasil mengambil kategori',
        'data' => $data
    ]);
}


public function delete($id = null)
{
    $model = new ProductModel();

    $model->deleteProduct($id);

    return $this->respond([
        'success' => true,
        'message' => 'Produk berhasil dihapus'
    ]);
}


public function generateCode()
{
    $model = new ProductModel();
    $code  = $model->generateProductCode();

    return $this->respond([
        'success' => true,
        'code' => $code
    ]);
}
public function updates($id)
{
    $model = new ProductModel();

    $image = $this->request->getFile('image');
    $imageName = $this->request->getPost('old_image');

    if ($image && $image->isValid() && !$image->hasMoved()) {
        $imageName = $image->getRandomName();
        $image->move('uploads/products/', $imageName);
    }

    $data = [
        'category_id'  => $this->request->getPost('category_id'),
        'product_name' => $this->request->getPost('product_name'),
        'image'        => $imageName,
        'price'        => $this->request->getPost('price'),
        'qty'          => $this->request->getPost('qty'),
        'is_active'    => $this->request->getPost('is_active')
    ];

    $model->updateProduct($id, $data);

    return $this->respond([
        'success' => true,
        'message' => 'Produk berhasil diupdate'
    ]);
}




}
