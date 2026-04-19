<?php

namespace App\Models;

use CodeIgniter\Model;

class CategoryModel extends Model
{
    protected $table = 'categories';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'category_name'
    ];

    protected $useTimestamps = false; // kita pakai created_at manual

    protected $returnType = 'array';

    public function searchCategories($limit = 10, $offset = 0, $search = '')
    {
        $builder = $this->builder();
        if (!empty($search)) {
            $builder->like('category_name', $search);
        }

        return $builder->orderBy('id', 'DESC')
                       ->limit($limit, $offset)
                       ->get()
                       ->getResultArray();
    }

    public function countCategories($search = '')
    {
        $builder = $this->builder();
        if (!empty($search)) {
            $builder->like('category_name', $search);
        }
        return $builder->countAllResults();
    }
}
