import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { HomeService } from 'src/app/services/home.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redeem-point',
  templateUrl: './redeem-point.page.html',
  styleUrls: ['./redeem-point.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RedeemPointPage implements OnInit {

  products: any[] = [];
  loading: boolean = true;
  userPoints: number = 0;

  constructor(
    private homeService: HomeService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    const userId = Number(localStorage.getItem('user_id'));

    // 1. Get Points
    this.homeService.getHome(userId).subscribe({
      next: (res) => {
        if (res.status) {
          this.userPoints = res.data.member.active_points;
        }
      }
    });

    // 2. Get Exchangeable Products
    this.homeService.getExchangeableProducts().subscribe({
      next: (res) => {
        if (res.status) {
          this.products = res.data.map((p: any) => ({
            ...p,
            image_url: p.image ? `${environment.apiBaseUrl}/uploads/products/${p.image}` : null
          }));
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showToast('Gagal memuat produk', 'danger');
      }
    });
  }

  async confirmRedeem(p: any) {
    if (this.userPoints < p.point_price) {
      this.showToast('Poin Anda tidak cukup', 'warning');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Tukar Poin',
      message: `Yakin ingin menukar ${p.point_price} poin dengan <b>${p.product_name}</b>?`,
      buttons: [
        { text: 'Batal', role: 'cancel' },
        { 
          text: 'Tukar Sekarang', 
          handler: () => this.redeem(p) 
        }
      ]
    });
    await alert.present();
  }

  redeem(p: any) {
    const userId = Number(localStorage.getItem('user_id'));
    this.homeService.redeemProduct(userId, p.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast('Penukaran Berhasil!', 'success');
          this.loadData(); // refresh points & products
          // Navigate to Pesanan Saya
          this.router.navigate(['/member/pesanan-saya']);
        } else {
          this.showToast(res.message || 'Gagal menukar poin', 'danger');
        }
      },
      error: () => this.showToast('Terjadi kesalahan sistem', 'danger')
    });
  }

  async showToast(msg: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  formatPrice(price: any) {
    return Number(price).toLocaleString('id-ID');
  }

  goBack() {
    this.router.navigate(['/member/home']);
  }
}
