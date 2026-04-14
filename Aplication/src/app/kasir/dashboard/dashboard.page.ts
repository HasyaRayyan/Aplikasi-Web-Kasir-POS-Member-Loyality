import { Component, OnInit, AfterViewInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import {
  DashboardService,
  BestProduct,
  RecentTransaction
} from 'src/app/services/dashboard.service';

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
  selector: 'app-kasir-dashboard',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './dashboard.page.html',
})
export class KasirDashboardPage implements OnInit, AfterViewInit {

  name: string = 'Kasir';
  chart!: Chart;

  // ===== METRICS =====
  todayTransaction = 0;
  todayRevenue = 0;
  todayProducts = 0;
  todayMembers = 0;

  // ===== DATA LIST =====
  bestProducts: BestProduct[] = [];
  recentTransactions: RecentTransaction[] = [];

  weeklyData: number[] = [0, 0, 0, 0, 0, 0, 0];

  constructor(private dashboardService: DashboardService) {}

  // ================= INIT =================
  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.name = user?.name || 'Kasir';

    this.loadMetrics();
    this.loadChart();
    this.loadBestProducts();
    this.loadRecentTransactions();
  }

  ngAfterViewInit() {}

  // ================= LOAD METRICS =================
  loadMetrics() {
    this.dashboardService.getMetrics().subscribe(res => {
      const d = res.data;
      this.todayTransaction = d.transactions || 0;
      this.todayRevenue = d.revenue || 0;
      this.todayProducts = d.products || 0;
      this.todayMembers = d.members || 0;
    });
  }

  // ================= LOAD CHART =================
  loadChart() {
    this.dashboardService.getWeeklyChart().subscribe(res => {
      this.weeklyData = res.data || [0,0,0,0,0,0,0];

      setTimeout(() => {
        this.initSalesChart();
      }, 50);
    });
  }

  // ================= LOAD BEST PRODUCT =================
  loadBestProducts() {
    this.dashboardService.getBestProducts().subscribe(res => {
      this.bestProducts = res.data || [];
    });
  }

  // ================= LOAD RECENT TRANSACTIONS =================
  loadRecentTransactions() {
    this.dashboardService.getRecentTransactions().subscribe(res => {
      this.recentTransactions = res.data || [];
    });
  }

  // ================= CHART =================
  initSalesChart() {
    const canvas = document.getElementById('salesChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
        datasets: [
          {
            label: 'Transaksi',
            data: this.weeklyData,
            backgroundColor: '#22c55e',
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
            ticks: { precision: 0 }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  // ================= HELPER =================
  formatPrice(val: number): string {
    return new Intl.NumberFormat('id-ID').format(val || 0);
  }
}
