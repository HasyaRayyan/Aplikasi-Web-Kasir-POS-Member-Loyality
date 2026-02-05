<?php

namespace App\Models;

use CodeIgniter\Model;

class ProductModel extends Model
{
    protected $table = 'products';
    protected $primaryKey = 'id';

public function getProductsWithAddons($limit, $offset, $search)
{
    $builder = $this->db->table('products p')
        ->select('
            p.id,
            p.product_code,
            p.product_name,
            p.image,
            p.price,
            p.qty,
            p.is_active,
            p.category_id,
            c.category_name,

            a.id as addon_id,
            a.addon_name,
            a.addon_price,
            a.qty as addon_qty
        ')
        ->join('categories c', 'c.id = p.category_id', 'left') // ⬅️ TAMBAH INI
        ->join('product_addons a', 'a.product_id = p.id', 'left');

    if ($search) {
        $builder->groupStart()
                ->like('p.product_name', $search)
                ->orLike('p.product_code', $search)
                ->groupEnd();
    }

    return $builder
        ->orderBy('p.id', 'DESC')
        ->limit($limit, $offset)
        ->get()
        ->getResultArray();
}

    public function countProducts($search)
    {
        $builder = $this->db->table('products');

        if ($search) {
            $builder->groupStart()
                    ->like('product_name', $search)
                    ->orLike('product_code', $search)
                    ->groupEnd();
        }

        return $builder->countAllResults();
    }



public function getAddons($limit, $offset, $search)
{
    $builder = $this->db->table('product_addons a')
        ->select('
            a.id,
            a.addon_name,
            a.addon_price,
            a.qty,
            p.product_name
        ')
        ->join('products p', 'p.id = a.product_id', 'left');

    if (!empty($search)) {
        $builder->groupStart()
                ->like('a.addon_name', $search)
                ->orLike('p.product_name', $search)
                ->groupEnd();
    }

    return $builder
        ->orderBy('a.id', 'DESC')
        ->limit((int)$limit, (int)$offset)
        ->get()
        ->getResultArray();
}
public function countAddons($search)
{
    $builder = $this->db->table('product_addons a')
        ->select('COUNT(a.id) as total')
        ->join('products p', 'p.id = a.product_id', 'left');

    if (!empty($search)) {
        $builder->groupStart()
                ->like('a.addon_name', $search)
                ->orLike('p.product_name', $search)
                ->groupEnd();
    }

    return $builder->countAllResults();
}

public function createProduct($data)
{
    return $this->db->table('products')->insert([
        'product_code' => $data['product_code'],
        'category_id'  => $data['category_id'],
        'product_name' => $data['product_name'],
        'image'        => $data['image'],
        'price'        => $data['price'],
        'qty'          => $data['qty'],
        'is_active'    => $data['is_active']
    ]);
}


public function deleteProduct($id)
{
    return $this->db->table('products')
        ->where('id', $id)
        ->delete();
}


public function getCategories()
{
    return $this->db->table('categories')
        ->select('id, category_name')
        ->orderBy('category_name', 'ASC')
        ->get()
        ->getResultArray();
}

public function generateProductCode()
{
    $last = $this->orderBy('id', 'DESC')->first();

    if (!$last) {
        return 'PROD-0001';
    }

    $lastCode = $last['product_code']; // PROD-0001
    $number   = (int) substr($lastCode, 5);
    $newNum   = $number + 1;

    return 'PROD-' . str_pad($newNum, 4, '0', STR_PAD_LEFT);
}

public function updateProduct($id, $data)
{
    return $this->db->table('products')
        ->where('id', $id)
        ->update($data);
}


public function getKasirProducts($search = '', $category = '', $limit = 9, $page = 1)
{
    $offset = ($page - 1) * $limit;

    $builder = $this->db->table('products p')
        ->select('
            p.id,
            p.product_code,
            p.product_name,
            p.image,
            p.price,
            p.qty,
            p.is_active,
            p.category_id,
            c.category_name
        ')
        ->join('categories c', 'c.id = p.category_id', 'left')
        ->where('p.is_active', 1);

    if (!empty($search)) {
        $builder->like('p.product_name', $search);
    }

    if (!empty($category)) {
        $builder->where('p.category_id', $category);
    }

    // TOTAL DATA
    $total = $builder->countAllResults(false);

    $products = $builder
        ->orderBy('p.product_name', 'ASC')
        ->limit($limit, $offset)
        ->get()
        ->getResultArray();

    foreach ($products as &$p) {
        $p['addons'] = $this->db->table('product_addons')
            ->select('id, addon_name, addon_price, qty')
            ->where('product_id', $p['id'])
            ->get()
            ->getResultArray();
    }

    return [
        'data' => $products,
        'total' => $total,
        'total_pages' => ceil($total / $limit)
    ];
}

}
