import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { 
  IonContent, IonIcon, IonSegment, IonSegmentButton, IonLabel, 
  IonSpinner, IonToast
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBack, refreshOutline, arrowForwardOutline, 
  arrowUpOutline, giftOutline 
} from 'ionicons/icons';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-poin-saya',
  templateUrl: './poin-saya.page.html',
  styleUrls: ['./poin-saya.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonIcon, IonSegment, IonSegmentButton, IonLabel,
    CommonModule, FormsModule, HttpClientModule, RouterModule
  ]
})
export class PoinSayaPage implements OnInit {

  userId: any;
  pointsData: any = {
    active_points: 0,
    lifetime_points: 0,
    membership_level: 'Basic',
    member_id_card: '',
    history: [],
    redemptions: []
  };
  
  loading: boolean = false;
  segment: string = 'history'; // history | redemptions

  constructor(
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) { 
    addIcons({ 
      'arrow-back': arrowBack, 
      'refresh-outline': refreshOutline, 
      'arrow-forward-outline': arrowForwardOutline, 
      'arrow-up-outline': arrowUpOutline, 
      'gift-outline': giftOutline 
    });
  }

  ngOnInit() {
    this.userId = localStorage.getItem('user_id');
    if (this.userId) {
      this.loadPointsData();
    }
  }

  async loadPointsData() {
    this.loading = true;

    this.http.get<any>(`${environment.apiBaseUrl}/api/member/points-history/${this.userId}`)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.pointsData = res.data;
          }
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.showToast('Gagal memuat data poin. Pastikan server aktif.', 'danger');
          console.error(err);
        }
      });
  }

  /* ================= UTIL (Dashboard Matching) ================= */

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  formatPoints(points: number): string {
    return (points || 0).toLocaleString('en-US');
  }

  getProgress(): number {
    const p = this.pointsData.lifetime_points || 0;
    if (p < 1000) return (p / 1000) * 100;
    if (p < 5000) return ((p - 1000) / 4000) * 100;
    if (p < 10000) return ((p - 5000) / 5000) * 100;
    return 100;
  }

  getNextLevel(): string {
    const p = this.pointsData.lifetime_points || 0;
    if (p < 1000) return 'GOLD';
    if (p < 5000) return 'PLATINUM';
    if (p < 10000) return 'DIAMOND';
    return 'MAX LEVEL';
  }

  getNextLevelPoints(): number {
    const p = this.pointsData.lifetime_points || 0;
    if (p < 1000) return 1000 - p;
    if (p < 5000) return 5000 - p;
    if (p < 10000) return 10000 - p;
    return 0;
  }

  async showToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      color: color,
      position: 'top'
    });
    t.present();
  }

  doRefresh(event: any) {
    this.loadPointsData().then(() => {
      event.target.complete();
    });
  }

  goBack() {
    window.history.back();
  }
}
