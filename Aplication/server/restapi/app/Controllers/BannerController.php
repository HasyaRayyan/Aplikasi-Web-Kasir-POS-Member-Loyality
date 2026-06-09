<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\BannerModel;

class BannerController extends ResourceController
{
    protected $format = 'json';

    public function index()
    {
        $model = new BannerModel();
        $search = $this->request->getGet('search') ?? '';
        
        $query = $model->orderBy('id', 'DESC');
        
        if ($search) {
            $query->like('title', $search);
        }
        
        $banners = $query->findAll();

        return $this->respond([
            'status' => true,
            'message' => 'Berhasil mengambil data slider',
            'data' => $banners
        ]);
    }

    public function create()
    {
        $model = new BannerModel();
        
        $image = $this->request->getFile('image');
        $imageName = null;

        if ($image && $image->isValid() && !$image->hasMoved()) {
            $imageName = $image->getRandomName();
            
            // Perbaikan path upload menggunakan FCPATH agar masuk ke public
            $uploadPath = FCPATH . 'uploads/banners/';
            if (!is_dir($uploadPath)) {
                mkdir($uploadPath, 0777, true);
            }
            
            $image->move($uploadPath, $imageName);
        }

        $data = [
            'title'     => $this->request->getPost('title'),
            'image'     => $imageName,
            'is_active' => $this->request->getPost('is_active') ?? 1
        ];

        if ($model->insert($data)) {
            return $this->respondCreated([
                'status' => true,
                'message' => 'Slider berhasil ditambahkan'
            ]);
        }

        return $this->fail('Gagal menambahkan slider');
    }

    public function update($id = null)
    {
        $model = new BannerModel();
        $banner = $model->find($id);

        if (!$banner) {
            return $this->failNotFound('Slider tidak ditemukan');
        }

        $image = $this->request->getFile('image');
        $imageName = $banner['image'];

        // Cek input title (bisa dikirim via POST jika multipart/form-data)
        $title = $this->request->getPost('title');
        $is_active = $this->request->getPost('is_active');

        $uploadPath = FCPATH . 'uploads/banners/';

        if ($image && $image->isValid() && !$image->hasMoved()) {
            // Delete old image if exists
            if ($imageName && file_exists($uploadPath . $imageName)) {
                @unlink($uploadPath . $imageName);
            }
            
            $imageName = $image->getRandomName();
            $image->move($uploadPath, $imageName);
        }

        $data = [
            'title'     => $title ?? $banner['title'],
            'image'     => $imageName,
            'is_active' => ($is_active !== null) ? $is_active : $banner['is_active']
        ];

        if ($model->update($id, $data)) {
            return $this->respond([
                'status' => true,
                'message' => 'Slider berhasil diperbarui'
            ]);
        }

        return $this->fail('Gagal memperbarui slider');
    }

    public function delete($id = null)
    {
        if (!$id) {
            return $this->fail('ID banner tidak valid');
        }

        $model = new BannerModel();
        $banner = $model->find($id);

        if (!$banner) {
            return $this->failNotFound('Slider tidak ditemukan');
        }

        // Delete image file
        $imageName = $banner['image'] ?? null;
        if ($imageName) {
            $imagePath = FCPATH . 'uploads/banners/' . $imageName;
            if (file_exists($imagePath)) {
                if (!@unlink($imagePath)) {
                    log_message('error', 'Gagal menghapus file gambar banner: ' . $imagePath);
                }
            }
        }

        log_message('debug', 'Attempting to delete banner ID: ' . $id);

        if ($model->delete($id)) {
            return $this->respondDeleted([
                'status' => true,
                'message' => 'Slider berhasil dihapus'
            ]);
        }

        return $this->fail('Gagal menghapus slide dari database');
    }

    public function toggle($id = null)
    {
        $model = new BannerModel();
        $banner = $model->find($id);

        if (!$banner) {
            return $this->failNotFound('Slider tidak ditemukan');
        }

        $status = ($banner['is_active'] == 1) ? 0 : 1;

        if ($model->update($id, ['is_active' => $status])) {
            return $this->respond([
                'status' => true,
                'message' => 'Status slider berhasil diubah',
                'is_active' => $status
            ]);
        }

        return $this->fail('Gagal mengubah status');
    }
}
