<?php

namespace App\Models;

use CodeIgniter\Model;

class ProductModel extends Model
{
    protected $table = 'products';
    protected $primaryKey = 'id';

public function getProductsWithAddons($limit, $offset, $search = '', $categoryId = null, $stockStatus = null)
{
    // 1. Ambil Produk Saja (Agar limit dan offset akurat pada produk)
    $builder = $this->db->table('products p')
        ->select('
            p.id,
            p.product_code,
            p.product_name,
            p.image,
            p.price,
            p.point_price,
            p.qty,
            p.is_active,
            p.category_id,
            p.created_at,
            p.is_exchangeable,
            c.category_name
        ')
        ->join('categories c', 'c.id = p.category_id', 'left');

    if ($search) {
        $builder->groupStart()
                ->like('p.product_name', $search)
                ->orLike('p.product_code', $search)
                ->groupEnd();
    }

    if ($categoryId) {
        $builder->where('p.category_id', $categoryId);
    }

    if ($stockStatus === 'sold_out') {
        $builder->where('p.qty <=', 0);
    } elseif ($stockStatus === 'available') {
        $builder->where('p.qty >', 0);
    }

    $products = $builder
        ->orderBy('p.id', 'DESC')
        ->limit($limit, $offset)
        ->get()
        ->getResultArray();

    if (empty($products)) {
        return [];
    }

    $productIds = array_column($products, 'id');

    // 2. Ambil Addons khusus untuk produk-produk di atas
    $addons = $this->db->table('product_addons a')
        ->select('
            a.product_id,
            a.id as addon_id,
            a.group_name,
            a.selection_type,
            a.is_required,
            a.addon_name,
            a.addon_price,
            a.point_price as addon_point_price,
            a.qty as addon_qty
        ')
        ->whereIn('a.product_id', $productIds)
        ->get()
        ->getResultArray();

    // 3. Gabungkan manual seperti layaknya LEFT JOIN
    $flatResult = [];

    foreach ($products as $p) {
        $hasAddon = false;
        foreach ($addons as $a) {
            if ($a['product_id'] == $p['id']) {
                $hasAddon = true;
                $row = array_merge($p, $a);
                $flatResult[] = $row;
            }
        }
        
        if (!$hasAddon) {
            $p['addon_id'] = null;
            $p['group_name'] = null;
            $p['selection_type'] = null;
            $p['is_required'] = null;
            $p['addon_name'] = null;
            $p['addon_price'] = null;
            $p['addon_point_price'] = null;
            $p['addon_qty'] = null;
            $flatResult[] = $p;
        }
    }

    return $flatResult;
}

    public function countProducts($search, $categoryId = null, $stockStatus = null)
    {
        $builder = $this->db->table('products');

        if ($search) {
            $builder->groupStart()
                    ->like('product_name', $search)
                    ->orLike('product_code', $search)
                    ->groupEnd();
        }

        if ($categoryId) {
            $builder->where('category_id', $categoryId);
        }

        if ($stockStatus === 'sold_out') {
            $builder->where('qty <=', 0);
        } elseif ($stockStatus === 'available') {
            $builder->where('qty >', 0);
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

public function createProduct($data, $addons = [])
{
    $this->db->table('products')->insert([
        'product_code' => $data['product_code'],
        'category_id'  => $data['category_id'],
        'product_name' => $data['product_name'],
        'image'        => $data['image'],
        'price'        => $data['price'],
        'point_price'  => $data['point_price'] ?? 0,
        'qty'          => $data['qty'],
        'is_active'    => $data['is_active'],
        'is_exchangeable' => $data['is_exchangeable'] ?? 1
    ]);

    $productId = $this->db->insertID();

    if (!empty($addons)) {
        $this->saveAddons($productId, $addons);
    }

    return $productId;
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

public function updateProduct($id, $data, $addons = null)
{
    $this->db->table('products')
        ->where('id', $id)
        ->update($data);

    if ($addons !== null) {
        $this->saveAddons($id, $addons);
    }

    return true;
}

private function saveAddons($productId, $addonGroups) {
    if (!$productId) return;

    // Hapus addon lama
    $this->db->table('product_addons')->where('product_id', $productId)->delete();
    
    $insertData = [];
    foreach ($addonGroups as $group) {
        $groupName    = $group['group_name'] ?? '';
        $type         = $group['selection_type'] ?? 'single';
        // boolean mapping
        $isRequired   = (!empty($group['is_required']) && ($group['is_required'] == 1 || $group['is_required'] == 'true')) ? 1 : 0;
        
        $items = $group['items'] ?? [];
        foreach ($items as $item) {
            $insertData[] = [
                'product_id'     => $productId,
                'group_name'     => $groupName,
                'selection_type' => $type,
                'is_required'    => $isRequired,
                'addon_name'     => $item['addon_name'] ?? '',
                'addon_price'    => $item['addon_price'] ?? 0,
                'point_price'    => $item['point_price'] ?? 0,
                'qty'            => $item['qty'] ?? 0
            ];
        }
    }
    
    if (count($insertData) > 0) {
        $this->db->table('product_addons')->insertBatch($insertData);
    }
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
            p.point_price,
            p.qty,
            p.is_active,
            p.category_id,
            p.is_exchangeable,
            c.category_name
        ')
        ->join('categories c', 'c.id = p.category_id', 'left')
        ->where('p.is_active', 1);

    if (!empty($search)) {
        $builder->groupStart()
            ->like('p.product_name', $search)
            ->orLike('p.product_code', $search)
        ->groupEnd();
    }

    if (!empty($category)) {
        $builder->where('p.category_id', $category);
    }

    // ===== TOTAL DATA =====
    $total = $builder->countAllResults(false);

    // ===== GET PRODUK =====
    $products = $builder
        ->orderBy('p.qty = 0', 'ASC', false) // stok 0 di bawah
        ->orderBy('p.product_name', 'ASC')
        ->limit($limit, $offset)
        ->get()
        ->getResultArray();

    // ===== GET ADDONS =====
    foreach ($products as &$p) {

        $addonsRaw = $this->db->table('product_addons')
            ->select('
                id,
                group_name,
                selection_type,
                addon_name,
                addon_price,
                point_price,
                qty,
                is_required
            ')
            ->where('product_id', $p['id'])
            ->orderBy('group_name', 'ASC')
            ->get()
            ->getResultArray();

        // ===== GROUPING ADDONS =====
        $groupedAddons = [];

        foreach ($addonsRaw as $a) {
            $group = $a['group_name'];

            if (!isset($groupedAddons[$group])) {
                $groupedAddons[$group] = [
                    'group_name' => $group,
                    'selection_type' => $a['selection_type'],
                    'is_required' => false,
                    'items' => []
                ];
            }

            // Jika ada salah satu item yg di set wajib, maka 1 grup wajib
            if (isset($a['is_required']) && $a['is_required'] == 1) {
                $groupedAddons[$group]['is_required'] = true;
            }

            $groupedAddons[$group]['items'][] = [
                'id' => $a['id'],
                'addon_name' => $a['addon_name'],
                'addon_price' => $a['addon_price'],
                'point_price' => $a['point_price'],
                'qty' => $a['qty']
            ];
        }

        // reset index biar array biasa
        $p['addons'] = array_values($groupedAddons);
    }

    return [
        'data' => $products,
        'total' => $total,
        'total_pages' => ceil($total / $limit)
    ];
}

}
