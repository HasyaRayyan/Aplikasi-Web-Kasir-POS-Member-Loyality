<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\DashboardModel;

class DashboardController extends ResourceController
{
    protected $format = 'json';

    protected $model;

    public function __construct()
    {
        $this->model = new DashboardModel();
    }

    // ================= METRICS =================
    public function metrics()
    {
        return $this->respond([
            'status' => true,
            'data' => $this->model->getTodayMetrics()
        ]);
    }

    // ================= CHART =================
    public function chart()
    {
        return $this->respond([
            'status' => true,
            'data' => $this->model->getWeeklyChart()
        ]);
    }

    // ================= PRODUK TERLARIS =================
    public function bestProducts()
    {
        return $this->respond([
            'status' => true,
            'data' => $this->model->getBestProducts()
        ]);
    }

    // ================= TRANSAKSI TERBARU =================
    public function recentTransactions()
    {
        return $this->respond([
            'status' => true,
            'data' => $this->model->getRecentTransactions()
        ]);
    }
}
