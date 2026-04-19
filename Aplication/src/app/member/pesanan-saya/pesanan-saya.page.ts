import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonIcon, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBack, refreshOutline, informationCircleOutline, 
  giftOutline, cafeOutline, star, chevronForward, idCardOutline 
} from 'ionicons/icons';
import { HomeService, RedemptionItem } from 'src/app/services/home.service';
import { environment } from 'src/environments/environment';
import { Router, RouterModule } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-pesanan-saya',
  templateUrl: './pesanan-saya.page.html',
  styleUrls: ['./pesanan-saya.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonIcon, IonSpinner,
    CommonModule, FormsModule, RouterModule
  ]
})
export class PesananSayaPage implements OnInit {

  redemptions: RedemptionItem[] = [];
  loading: boolean = true;
  apiUrl = environment.apiBaseUrl;

  constructor(
    private homeService: HomeService,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    addIcons({ 
      'arrow-back': arrowBack, 
      'refresh-outline': refreshOutline, 
      'information-circle-outline': informationCircleOutline, 
      'gift-outline': giftOutline, 
      'cafe-outline': cafeOutline, 
      'star': star, 
      'chevron-forward': chevronForward, 
      'id-card-outline': idCardOutline 
    });
  }

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.loading = true;
    const userId = Number(localStorage.getItem('user_id'));

    this.homeService.getMemberRedemptions(userId).subscribe({
      next: (res) => {
        if (res.status) {
          const now = new Date().getTime();
          this.redemptions = res.data.map((r: any) => {
            
            // Auto expire checking on frontend
            let currentStatus = r.status;
            if (currentStatus === 'pending') {
               const expDate = new Date(r.expired_at).getTime();
               if (now > expDate) {
                  currentStatus = 'expired';
               }
            }

            return {
              ...r,
              status: currentStatus,
              product_image: r.image ? `${this.apiUrl}/uploads/products/${r.image}` : null
            };
          });
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
      case 'expired': return 'Hangus';
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
