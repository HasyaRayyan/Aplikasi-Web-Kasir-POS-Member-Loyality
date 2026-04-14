import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { DashboardService, DashboardMetrics, BestProduct, RecentTransaction } from 'src/app/services/dashboard.service';

import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './dashboard.page.html',
})
export class AdminDashboard implements OnInit, AfterViewInit {

  name: string = 'Admin';
  chart!: Chart;
  
  metrics: DashboardMetrics = { transactions: 0, revenue: 0, products: 0, members: 0 };
  products: BestProduct[] = [];
  transactions: RecentTransaction[] = [];
  chartData: number[] = [0, 0, 0, 0, 0, 0, 0];
  loading: boolean = true;

  constructor(
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.name = user?.name || 'Admin';
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Fetch Metrics
    this.dashboardService.getMetrics().subscribe(res => {
      if (res.status) this.metrics = res.data;
    });

    // Fetch Products
    this.dashboardService.getBestProducts().subscribe(res => {
      if (res.status) this.products = res.data;
    });

    // Fetch Transactions
    this.dashboardService.getRecentTransactions().subscribe(res => {
      if (res.status) this.transactions = res.data;
    });

    // Fetch Chart Data
    this.dashboardService.getWeeklyChart().subscribe(res => {
       if (res.status) {
         this.chartData = res.data;
         this.updateSalesChart();
         this.loading = false;
       }
    });
  }

  ngAfterViewInit() {
    this.initSalesChart();
  }

  initSalesChart() {
    const canvas = document.getElementById('salesChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
        datasets: [
          {
            label: 'Jumlah Transaksi',
            data: this.chartData,
            backgroundColor: '#10b981', // Emerald 500
            hoverBackgroundColor: '#059669', // Emerald 600
            borderRadius: 8,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f8fafc' }, // Slate 50
            border: { display: false }
          },
          x: {
            grid: { display: false },
            border: { display: false }
          }
        }
      }
    });
  }
  
  updateSalesChart() {
    if (this.chart) {
      this.chart.data.datasets[0].data = this.chartData;
      this.chart.update();
    }
  }

  formatPrice(v: number) {
    return Number(v).toLocaleString('id-ID');
  }
}
