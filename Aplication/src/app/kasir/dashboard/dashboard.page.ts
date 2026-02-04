import { Component, OnInit, AfterViewInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

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

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.name = user?.name || 'Kasir';
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
            label: 'Transaksi',
            data: [10, 14, 8, 17, 21, 25, 19],
            backgroundColor: '#22c55e',
            borderRadius: 8,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true },
          x: { grid: { display: false } }
        }
      }
    });
  }
}
