<?php

namespace App\Models;

use CodeIgniter\Model;

class ProductAddonModel extends Model
{
    protected $table = 'product_addons';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'product_id',
        'addon_name',
        'addon_price',
        'qty'
    ];

    public function getAddons($limit, $offset, $search = '')
    {
        $builder = $this->db->table('product_addons a')
            ->select('
                a.id,
                a.product_id,
                a.addon_name,
                a.addon_price,
                a.qty,
                p.product_name
            ')
            ->join('products p', 'p.id = a.product_id', 'left');

        if ($search) {
            $builder->like('a.addon_name', $search);
        }

        return $builder
            ->orderBy('a.id', 'DESC')
            ->limit($limit, $offset)
            ->get()
            ->getResultArray();
    }

    public function countAddons($search = '')
    {
        $builder = $this->db->table('product_addons');

        if ($search) {
            $builder->like('addon_name', $search);
        }

        return $builder->countAllResults();
    }

    public function createAddon($data)
    {
        return $this->insert($data);
    }

    public function updateAddon($id, $data)
    {
        return $this->update($id, $data);
    }

    public function deleteAddon($id)
    {
        return $this->delete($id);
    }
}
