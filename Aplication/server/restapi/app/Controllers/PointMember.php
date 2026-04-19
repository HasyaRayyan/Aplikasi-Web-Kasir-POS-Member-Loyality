<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use App\Models\PointMemberModel;

class PointMember extends BaseController
{
    protected $pointModel;

    public function __construct()
    {
        $this->pointModel = new PointMemberModel();
    }

    /**
     * Endpoint: GET /api/member/points-history/(:num)
     */
    public function history($userId)
    {
        $member = $this->pointModel->getMemberData($userId);

        if (!$member) {
            return $this->response->setStatusCode(404)->setJSON([
                'success' => false,
                'message' => 'Data member tidak ditemukan'
            ]);
        }

        $memberId = $member['id'];
        
        $ledger = $this->pointModel->getLedgerHistory($memberId);
        $redemptions = $this->pointModel->getRedemptionHistory($memberId);

        return $this->response->setJSON([
            'success' => true,
            'data' => [
                'active_points'    => (int)$member['active_points'],
                'lifetime_points'  => (int)$member['lifetime_points'],
                'membership_level' => $member['membership_level'],
                'member_id_card'   => $member['member_id'],
                'history'          => $ledger,
                'redemptions'      => $redemptions
            ]
        ]);
    }
}
