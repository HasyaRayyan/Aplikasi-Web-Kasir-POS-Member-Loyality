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
                'point_price'   => $r['point_price'],
                'qty'           => $r['qty'],
                'is_active'     => $r['is_active'],

                // ⬇️ TAMBAHAN KATEGORI
                'category_id'   => $r['category_id'],
                'category_name' => $r['category_name'],
                
                'created_at'    => $r['created_at'],

                'addons'        => []
            ];

        }

        if ($r['addon_id']) {
            $groupName = $r['group_name'];
            $groupIndex = -1;

            foreach ($products[$pid]['addons'] as $i => $g) {
                if ($g['group_name'] === $groupName) {
                    $groupIndex = $i;
                    break;
                }
            }

            if ($groupIndex === -1) {
                $products[$pid]['addons'][] = [
                    'group_name'     => $groupName,
                    'selection_type' => $r['selection_type'],
                    'is_required'    => $r['is_required'] == 1,
                    'items'          => []
                ];
                $groupIndex = count($products[$pid]['addons']) - 1;
            }

            $products[$pid]['addons'][$groupIndex]['items'][] = [
                'id'          => $r['addon_id'],
                'addon_name'  => $r['addon_name'],
                'addon_price' => $r['addon_price'],
                'qty'         => $r['addon_qty']
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
        'point_price'  => $this->request->getPost('point_price'),
        'qty'          => $this->request->getPost('qty'),
        'is_active'    => $this->request->getPost('is_active')
    ];

    $addonsJson = $this->request->getPost('addons');
    $addons = $addonsJson ? json_decode($addonsJson, true) : [];

    $model->createProduct($data, $addons);

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
        'point_price'  => $this->request->getPost('point_price'),
        'qty'          => $this->request->getPost('qty'),
        'is_active'    => $this->request->getPost('is_active')
    ];

    $addonsJson = $this->request->getPost('addons');
    // kalau string kosong / tidak dikirim, anggap array kosong
    $addons = ($addonsJson !== null && $addonsJson !== '') ? json_decode($addonsJson, true) : [];

    $model->updateProduct($id, $data, $addons);

    return $this->respond([
        'success' => true,
        'message' => 'Produk berhasil diupdate'
    ]);
}




}
