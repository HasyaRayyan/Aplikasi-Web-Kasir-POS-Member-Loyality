<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\UserModel;

class UserController extends ResourceController
{
    protected $format = 'json';

    // ================= GET ALL =================
    public function index()
    {
        $model = new UserModel();
        
        $page = $this->request->getVar('page') ?? 1;
        $limit = $this->request->getVar('limit') ?? 10;
        $search = $this->request->getVar('search') ?? '';
        
        $offset = ($page - 1) * $limit;
        
        $data = $model->getAllUsers($limit, $offset, $search);
        $total = $model->countUsers($search);

        return $this->respond([
            'status' => true,
            'data' => $data,
            'meta' => [
                'total' => $total,
                'page' => (int)$page,
                'limit' => (int)$limit,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
    }

    // ================= CREATE =================
    public function create()
    {
        $model = new UserModel();
        $data = $this->request->getJSON(true);

        $model->createUser($data);

        return $this->respond([
            'status' => true,
            'message' => 'User berhasil dibuat'
        ]);
    }

    // ================= UPDATE =================
    public function update($id = null)
    {
        $model = new UserModel();
        $data = $this->request->getJSON(true);

        $model->updateUser($id, $data);

        return $this->respond([
            'status' => true,
            'message' => 'User berhasil diupdate'
        ]);
    }

    // ================= DELETE =================
    public function delete($id = null)
    {
        $model = new UserModel();
        $model->deleteUser($id);

        return $this->respond([
            'status' => true,
            'message' => 'User berhasil dihapus'
        ]);
    }


    // ================= GET ROLES =================
public function roles()
{
    $model = new UserModel();

    return $this->respond([
        'status' => true,
        'data' => $model->getRoles()
    ]);
}

}
