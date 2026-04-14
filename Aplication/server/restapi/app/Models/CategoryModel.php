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
}
