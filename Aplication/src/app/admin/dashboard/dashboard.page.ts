import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    IonicModule,
    CommonModule
  ],
  templateUrl: './dashboard.page.html',
})
export class AdminDashboardPage {

  constructor(private router: Router) {}

  openProduk() {
    this.router.navigate(['/admin/produk']);
  }

  openMember() {
    this.router.navigate(['/admin/member']);
  }

  openTransaksi() {
    this.router.navigate(['/admin/transaksi']);
  }

  openLaporan() {
    this.router.navigate(['/admin/laporan']);
  }
}
