<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\ProductAddonModel;

class AddonController extends ResourceController
{
    protected $format = 'json';

    // ================= LIST =================
    public function index()
    {
        $model = new ProductAddonModel();

        $page   = (int) ($this->request->getGet('page') ?? 1);
        $limit  = (int) ($this->request->getGet('limit') ?? 10);
        $search = $this->request->getGet('search') ?? '';

        $offset = ($page - 1) * $limit;

        $total = $model->countAddons($search);
        $data  = $model->getAddons($limit, $offset, $search);

        return $this->respond([
            'success' => true,
            'data' => $data,
            'meta' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
    }

    // ================= CREATE =================
public function create()
{
    $model = new ProductAddonModel();
    $json  = $this->request->getJSON(true);

    $items = $json['items'] ?? [];

    foreach ($items as $item) {
        $data = [
            'product_id'     => $json['product_id'],
            'group_name'     => $json['group_name'],
            'selection_type' => $json['selection_type'],
            'addon_name'     => $item['addon_name'],
            'addon_price'    => $item['addon_price'],
            'qty'            => $item['qty']
        ];

        $model->createAddon($data);
    }

    return $this->respond([
        'success' => true,
        'message' => 'Addon berhasil ditambahkan'
    ]);
}


    // ================= UPDATE =================
public function update($id = null)
{
    $model = new ProductAddonModel();
    $json  = $this->request->getJSON(true);

    // HAPUS GROUP LAMA
    $old = $model->find($id);
    $model->where('group_name', $old['group_name'])->delete();

    // INSERT ULANG
    foreach ($json['items'] as $item) {
        $data = [
            'product_id'     => $json['product_id'],
            'group_name'     => $json['group_name'],
            'selection_type' => $json['selection_type'],
            'addon_name'     => $item['addon_name'],
            'addon_price'    => $item['addon_price'],
            'qty'            => $item['qty']
        ];

        $model->insert($data);
    }

    return $this->respond([
        'success' => true,
        'message' => 'Addon berhasil diupdate'
    ]);
}

    // ================= DELETE =================
    public function delete($id = null)
    {
        $model = new ProductAddonModel();
        $model->deleteAddon($id);

        return $this->respond([
            'success' => true,
            'message' => 'Addon berhasil dihapus'
        ]);
    }
}
