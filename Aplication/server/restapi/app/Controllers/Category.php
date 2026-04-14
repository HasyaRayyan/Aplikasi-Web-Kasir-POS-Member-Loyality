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
        $data = $this->model->findAll();

        return $this->respond([
            'status' => true,
            'data'   => $data
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
            return $this->fail('Category name wajib diisi');
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
            return $this->failNotFound('Category tidak ditemukan');
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

        $this->model->delete($id);

        return $this->respondDeleted([
            'status' => true,
            'message' => 'Category berhasil dihapus'
        ]);
    }
}
