import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HomeService, PointHistoryItem } from 'src/app/services/home.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-poin-saya',
  templateUrl: './poin-saya.page.html',
  styleUrls: ['./poin-saya.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PoinSayaPage implements OnInit {

  loading: boolean = true;
  totalPoints: number = 0;
  history: PointHistoryItem[] = [];

  constructor(
    private homeService: HomeService,
    private toastCtrl: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadPointHistory();
  }

  loadPointHistory() {
    this.loading = true;
    const userId = Number(localStorage.getItem('user_id'));

    this.homeService.getPointHistory(userId).subscribe({
      next: (res) => {
        if (res.status) {
          this.totalPoints = res.data.total_points;
          this.history = res.data.history;
        } else {
          // If the backend is not yet fully implemented for this, provide mock data fallback
          this.fallbackToMockData();
        }
        this.loading = false;
      },
      error: () => {
        this.fallbackToMockData();
        this.loading = false;
      }
    });
  }

  fallbackToMockData() {
    this.totalPoints = 850;
    this.history = [
      {
        id: 1,
        invoice_code: 'INV-20231010-001',
        points: 150,
        status: 'active',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        expired_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        invoice_code: 'INV-20231005-045',
        points: 300,
        status: 'active',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        expired_at: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        invoice_code: 'INV-20230915-021',
        points: 400,
        status: 'active',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        expired_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        invoice_code: 'INV-20230110-011',
        points: 200,
        status: 'expired',
        created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
        expired_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    this.showToast('Menggunakan data simulasi (backend belum tersedia)', 'warning');
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'active': return 'status-active';
      case 'used': return 'status-used';
      case 'expired': return 'status-expired';
      default: return 'status-default';
    }
  }

  getStatusName(status: string): string {
    switch(status) {
      case 'active': return 'Aktif';
      case 'used': return 'Digunakan';
      case 'expired': return 'Kadaluwarsa';
      default: return status;
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    // Format "12 Okt 2023"
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
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
}
