import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
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
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
  ],
  templateUrl: './dashboard.page.html',
})
export class AdminDashboard implements OnInit, AfterViewInit {

  name: string = 'Admin';
  chart!: Chart;

  constructor(private router: Router) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.name = user?.name || 'Admin';
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
            data: [12, 19, 8, 15, 22, 30, 18],
            backgroundColor: '#6366f1',
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
            grid: { color: '#f3f4f6' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }
}
