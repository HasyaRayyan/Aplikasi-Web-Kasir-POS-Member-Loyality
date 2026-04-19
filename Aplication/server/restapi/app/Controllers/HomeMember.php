<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use App\Models\HomeModel;

class HomeMember extends BaseController
{
    protected $homeModel;

    public function __construct()
    {
        $this->homeModel = new HomeModel();
    }

    public function index($userId)
    {
        $userMember = $this->homeModel->getUserMember($userId);

        if (!$userMember) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'User tidak ditemukan'
            ]);
        }

        /* AUTO-CREATE MEMBER RECORD + ID IF MISSING */
        if (!$userMember['member_id']) {
            $db = \Config\Database::connect();
            $p1 = strtoupper(substr(md5(uniqid()), 0, 4));
            $p2 = strtoupper(substr(md5(uniqid()), 0, 4));
            $newId = "4444-$p1-$p2";

            // Jika row member belum ada sama sekali
            if (!$userMember['id_member_tbl']) {
                $db->table('members')->insert([
                    'user_id' => $userId,
                    'member_id' => $newId,
                    'active_points' => 0,
                    'lifetime_points' => 0,
                    'membership_level' => 'Silver'
                ]);
            } else {
                // Berarti row ada tapi member_id kosong
                $db->table('members')->where('user_id', $userId)->update(['member_id' => $newId]);
            }
            // Refresh data
            $userMember = $this->homeModel->getUserMember($userId);
        }

        $products = $this->homeModel->getActiveProducts();
        $recent = $this->homeModel->getRecentActivityByMember($userId);
        $banners = $this->homeModel->getActiveBanners();

        return $this->response->setJSON([
            'status' => true,
            'data' => [
                'user' => [
                    'id'       => $userMember['id'],
                    'name'     => $userMember['name'],
                    'username' => $userMember['username'],
                    'phone'    => $userMember['phone'],
                    'email'    => $userMember['email'],
                    'image'    => $userMember['image'],
                    'image_url' => $userMember['image'] ? base_url('uploads/profile/' . $userMember['image']) : null
                ],
                'member' => [
                    'member_id'        => $userMember['member_id'],
                    'active_points'    => $userMember['active_points'] ?? 0,
                    'lifetime_points'  => $userMember['lifetime_points'] ?? 0,
                    'membership_level' => $userMember['membership_level'] ?? 'Basic'
                ],
                'products' => $products,
                'banners'  => $banners,
                'recent_transactions' => $recent
            ]
        ]);
    }

    public function pointsHistory($userId)
    {
        $res = $this->homeModel->getPointLedger($userId);

        return $this->response->setJSON([
            'status' => true,
            'data'   => [
                'total_points' => $res['total_points'],
                'history'      => $res['history']
            ]
        ]);
    }

    public function debugData($userId)
    {
        $db = \Config\Database::connect();
        $user = $db->table('users')->where('id', $userId)->get()->getRowArray();
        $member = $db->table('members')->where('user_id', $userId)->get()->getRowArray();
        $ledger = $db->table('member_point_ledger')->where('member_id', $member['id'] ?? 0)->get()->getResultArray();
        $transactions = $db->table('transactions')->where('user_id', $member['id'] ?? 0)->get()->getResultArray();

        return $this->response->setJSON([
            'user' => $user,
            'member' => $member,
            'ledger' => $ledger,
            'transactions' => $transactions
        ]);
    }
}
