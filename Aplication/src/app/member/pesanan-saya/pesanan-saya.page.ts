import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HomeService, RedemptionItem } from 'src/app/services/home.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pesanan-saya',
  templateUrl: './pesanan-saya.page.html',
  styleUrls: ['./pesanan-saya.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PesananSayaPage implements OnInit {

  redemptions: RedemptionItem[] = [];
  loading: boolean = true;
  apiUrl = environment.apiBaseUrl;

  constructor(
    private homeService: HomeService,
    private toastCtrl: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.loading = true;
    const userId = Number(localStorage.getItem('user_id'));

    this.homeService.getMemberRedemptions(userId).subscribe({
      next: (res) => {
        if (res.status) {
          this.redemptions = res.data.map(r => ({
            ...r,
            product_image: r.image ? `${this.apiUrl}/uploads/products/${r.image}` : null
          }));
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showToast('Gagal memuat riwayat', 'danger');
      }
    });
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'pending': return 'warning';
      case 'claimed': return 'success';
      case 'expired': return 'danger';
      default: return 'medium';
    }
  }

  getStatusText(status: string) {
    switch (status) {
      case 'pending': return 'Siap Diambil';
      case 'claimed': return 'Sudah Diambil';
      case 'expired': return 'Kadaluwarsa';
      default: return status;
    }
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

  goBack() {
    this.router.navigate(['/member/home']);
  }
}
