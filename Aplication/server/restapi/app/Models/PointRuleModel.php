<?php

namespace App\Models;

use CodeIgniter\Model;

class PointRuleModel extends Model
{
    protected $table      = 'point_rules';
    protected $primaryKey = 'id';

    // TAMBAHKAN 'is_default' ke dalam allowedFields
    protected $allowedFields = [
        'event_name',
        'start_date',
        'end_date',
        'amount_per_point',
        'point_value',
        'is_active',
        'is_default' 
    ];

    protected $useTimestamps = false;

    // ================= RULE AKTIF =================
    public function getActiveRule()
    {
        // 1. Cek apakah ada PROMO / EVENT yang sedang aktif hari ini (bukan default)
        $promoRule = $this->where('is_active', 1)
            ->where('is_default', 0) // Pastikan bukan rule default
            ->where('start_date <=', date('Y-m-d'))
            ->where('end_date >=', date('Y-m-d'))
            ->orderBy('id', 'DESC')
            ->first();

        // Jika ada promo aktif, langsung kembalikan data promo tersebut
        if ($promoRule) {
            return $promoRule;
        }

        // 2. Jika tidak ada promo, JALANKAN RULE DEFAULT (Rp 1.000 = 1 Poin)
        return $this->where('is_active', 1)
            ->where('is_default', 1) // Ambil yang default
            ->first();
    }

    // ================= LIST + SEARCH =================
    public function getList($limit, $offset, $search = '')
    {
        $builder = $this->builder();

        if ($search) {
            $builder->like('event_name', $search);
        }

        return $builder
            ->orderBy('is_default', 'DESC') // Tampilkan rule default di urutan teratas
            ->orderBy('created_at', 'DESC')
            ->limit($limit, $offset)
            ->get()
            ->getResultArray();
    }

    public function countList($search = '')
    {
        $builder = $this->builder();

        if ($search) {
            $builder->like('event_name', $search);
        }

        return $builder->countAllResults();
    }

    // ================= SET ACTIVE ONLY =================
    public function setActiveOnly($id)
    {
        // 1. Cari tahu apakah rule yang mau diaktifkan ini adalah rule 'default'
        $rule = $this->find($id);
        
        if ($rule && $rule['is_default'] == 1) {
            // Jika admin mencoba mengaktifkan rule default, biarkan saja (jangan matikan yang lain)
            // Karena rule default memang seharusnya selalu aktif untuk berjaga-jaga
            $this->update($id, ['is_active' => 1]);
        } else {
            // 2. Jika admin mengaktifkan rule PROMO, nonaktifkan promo lain
            // (TAPI jangan nonaktifkan rule default)
            $this->builder()
                 ->where('is_default', 0)
                 ->update(['is_active' => 0]);

            // aktifkan promo yg dipilih
            $this->update($id, ['is_active' => 1]);
        }
    }
}