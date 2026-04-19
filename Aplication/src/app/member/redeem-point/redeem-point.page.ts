import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { 
  IonContent, IonIcon, IonModal 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBack, refreshOutline, star, giftOutline, 
  cafeOutline, cubeOutline 
} from 'ionicons/icons';
import { HomeService } from 'src/app/services/home.service';
import { environment } from 'src/environments/environment';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-redeem-point',
  templateUrl: './redeem-point.page.html',
  styleUrls: ['./redeem-point.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonIcon, IonModal,
    CommonModule, FormsModule, RouterModule
  ]
})
export class RedeemPointPage implements OnInit {
  Number = Number;
  products: any[] = [];
  loading: boolean = true;
  userPoints: number = 0;
  
  isModalOpen: boolean = false;
  selectedProduct: any = null;

  constructor(
    private homeService: HomeService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) { 
    addIcons({ 
      'arrow-back': arrowBack, 
      'refresh-outline': refreshOutline, 
      'star': star, 
      'gift-outline': giftOutline, 
      'cafe-outline': cafeOutline, 
      'cube-outline': cubeOutline 
    });
  }

  ngOnInit() {
    this.loadRedeemableProducts();
  }

  loadRedeemableProducts() {
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

  confirmRedeem(p: any) {
    if (this.Number(this.userPoints) < this.Number(p.point_price)) {
      this.showToast('Poin Anda tidak cukup', 'warning');
      return;
    }
    this.selectedProduct = p;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    setTimeout(() => {
      this.selectedProduct = null;
    }, 300);
  }

  processRedeem() {
    if (!this.selectedProduct) return;
    const p = this.selectedProduct;
    this.isModalOpen = false;
    this.redeem(p);
  }

  redeem(p: any) {
    const userId = Number(localStorage.getItem('user_id'));
    this.homeService.redeemProduct(userId, p.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast('Penukaran Berhasil!', 'success');
          this.loadRedeemableProducts(); // refresh points & products
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
