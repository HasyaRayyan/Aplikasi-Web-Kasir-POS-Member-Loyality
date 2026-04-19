<?php

namespace App\Controllers;

use App\Models\CategoryModel;
use CodeIgniter\RESTful\ResourceController;

class Category extends ResourceController
{
    protected $modelName = CategoryModel::class;
    protected $format    = 'json';

    // ================= GET ALL =================
    public function index()
    {
        $page = $this->request->getVar('page') ?? 1;
        $limit = $this->request->getVar('limit') ?? 10;
        $search = $this->request->getVar('search') ?? '';
        
        $offset = ($page - 1) * $limit;
        
        $data = $this->model->searchCategories($limit, $offset, $search);
        $total = $this->model->countCategories($search);

        return $this->respond([
            'status' => true,
            'data'   => $data,
            'meta'   => [
                'total' => $total,
                'page' => (int)$page,
                'limit' => (int)$limit,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
    }

    // ================= GET BY ID =================
    public function show($id = null)
    {
        $data = $this->model->find($id);

        if (!$data) {
            return $this->failNotFound('Category tidak ditemukan');
        }

        return $this->respond([
            'status' => true,
            'data'   => $data
        ]);
    }

    // ================= CREATE =================
    public function create()
    {
        $json = $this->request->getJSON(true);

        if (!$json['category_name']) {
            return $this->fail('Nama kategori wajib diisi');
        }

        // Check duplicate
        $existing = $this->model->where('category_name', $json['category_name'])->first();
        if ($existing) {
            return $this->fail('Kategori "' . $json['category_name'] . '" sudah tersedia.');
        }

        $this->model->insert([
            'category_name' => $json['category_name']
        ]);

        return $this->respondCreated([
            'status' => true,
            'message' => 'Category berhasil ditambahkan'
        ]);
    }

    // ================= UPDATE =================
    public function update($id = null)
    {
        $json = $this->request->getJSON(true);

        if (!$this->model->find($id)) {
            return $this->failNotFound('Kategori tidak ditemukan');
        }

        if (!$json['category_name']) {
            return $this->fail('Nama kategori wajib diisi');
        }

        // Check duplicate excluding current ID
        $existing = $this->model->where('category_name', $json['category_name'])
                                ->where('id !=', $id)
                                ->first();
        if ($existing) {
            return $this->fail('Kategori "' . $json['category_name'] . '" sudah tersedia.');
        }

        $this->model->update($id, [
            'category_name' => $json['category_name']
        ]);

        return $this->respond([
            'status' => true,
            'message' => 'Category berhasil diupdate'
        ]);
    }

    // ================= DELETE =================
    public function delete($id = null)
    {
        if (!$this->model->find($id)) {
            return $this->failNotFound('Category tidak ditemukan');
        }

        // Diagnostic Check: Find which products are blocking the delete
        $db = \Config\Database::connect();
        $blockingProducts = $db->table('products')
            ->select('product_name, product_code')
            ->where('category_id', $id)
            ->get()
            ->getResultArray();

        if (!empty($blockingProducts)) {
            $list = array_map(function($p) {
                return $p['product_name'] . " (" . $p['product_code'] . ")";
            }, $blockingProducts);
            $names = implode(", ", $list);
            return $this->fail("Gagal menghapus: Kategori ini masih digunakan oleh produk berikut: $names. Silakan hapus atau pindahkan produk tersebut terlebih dahulu.");
        }

        try {
            $this->model->delete($id);
            return $this->respondDeleted([
                'status' => true,
                'message' => 'Category berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return $this->fail('Gagal menghapus: ' . $e->getMessage());
        }
    }
}
