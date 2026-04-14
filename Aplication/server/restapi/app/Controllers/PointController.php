<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\PointRuleModel;

class PointController extends ResourceController
{
    protected $format = 'json';
    protected $modelName = PointRuleModel::class;

    // ================= RULE AKTIF =================
    public function active()
    {
        $rule = $this->model->getActiveRule();

        return $this->respond([
            'status' => true,
            'data'   => $rule
        ]);
    }

    // ================= LIST =================
public function index()
{
    $page   = $this->request->getGet('page') ?? 1;
    $search = $this->request->getGet('search') ?? '';
    $limit  = 10;
    $offset = ($page - 1) * $limit;

    $data  = $this->model->getList($limit, $offset, $search);
    $total = $this->model->countList($search);

    return $this->respond([
        'status' => true,
        'data'   => $data,
        'meta'   => [
            'page'        => (int)$page,
            'total_pages' => ceil($total / $limit),
            'total_data'  => $total
        ]
    ]);
}


    // ================= CREATE =================
    public function create()
    {
        $input = $this->request->getJSON(true);

        $this->model->insert($input);

        return $this->respondCreated([
            'status'  => true,
            'message' => 'Point rule berhasil dibuat'
        ]);
    }

    // ================= UPDATE =================
    public function update($id = null)
    {
        $input = $this->request->getJSON(true);

        $this->model->update($id, $input);

        return $this->respond([
            'status'  => true,
            'message' => 'Point rule berhasil diupdate'
        ]);
    }

    // ================= DELETE =================
    public function delete($id = null)
    {
        $this->model->delete($id);

        return $this->respond([
            'status'  => true,
            'message' => 'Point rule berhasil dihapus'
        ]);
    }

    // ================= SET ACTIVE =================
    public function setActive($id)
    {
        $this->model->setActiveOnly($id);

        return $this->respond([
            'status'  => true,
            'message' => 'Point rule diaktifkan'
        ]);
    }
}
