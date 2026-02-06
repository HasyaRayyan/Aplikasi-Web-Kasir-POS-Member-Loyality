<?php

namespace App\Models;

use CodeIgniter\Model;

class ProductAddonModel extends Model
{
    protected $table = 'product_addons';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'product_id',
        'group_name',
        'selection_type',
        'addon_name',
        'addon_price',
        'qty'
    ];

    // ================= LIST =================
    public function getAddons($limit, $offset, $search = '')
    {
        $builder = $this->db->table('product_addons a')
            ->select('
                a.id,
                a.product_id,
                a.group_name,
                a.selection_type,
                a.addon_name,
                a.addon_price,
                a.qty,
                p.product_name
            ')
            ->join('products p', 'p.id = a.product_id', 'left');

        if ($search) {
            $builder->groupStart()
                ->like('a.addon_name', $search)
                ->orLike('a.group_name', $search)
                ->orLike('p.product_name', $search)
                ->groupEnd();
        }

        return $builder
            ->orderBy('a.group_name', 'ASC')
            ->orderBy('a.id', 'DESC')
            ->limit($limit, $offset)
            ->get()
            ->getResultArray();
    }

    // ================= COUNT =================
    public function countAddons($search = '')
    {
        $builder = $this->db->table('product_addons a')
            ->join('products p', 'p.id = a.product_id', 'left');

        if ($search) {
            $builder->groupStart()
                ->like('a.addon_name', $search)
                ->orLike('a.group_name', $search)
                ->orLike('p.product_name', $search)
                ->groupEnd();
        }

        return $builder->countAllResults();
    }

    // ================= CREATE =================
    public function createAddon($data)
    {
        return $this->insert($data);
    }

    // ================= UPDATE =================
    public function updateAddon($id, $data)
    {
        return $this->update($id, $data);
    }

    // ================= DELETE =================
    public function deleteAddon($id)
    {
        return $this->delete($id);
    }
}
