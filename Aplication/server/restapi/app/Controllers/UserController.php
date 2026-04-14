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

        return $this->respond([
            'status' => true,
            'data' => $model->getAllUsers()
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
