import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { HttpClientModule } from '@angular/common/http';
import { HomeService } from 'src/app/services/home.service';
import { environment } from 'src/environments/environment';
import { Router, RouterModule } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    HttpClientModule,
    RouterModule
  ]
})
export class HomePage implements OnInit {

  user: any = {};
  hasNotification: boolean = false;

  products: any[] = [];
  recentActivities: any[] = [];

  constructor(
    private homeService: HomeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadHome();
  }

  loadHome() {
    const userId = localStorage.getItem('user_id');

    // JIKA TIDAK ADA LOGIN → BALIK KE LOGIN
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.homeService.getHome(Number(userId)).subscribe({
      next: (res) => {
        console.log('HOME RES', res);

        if (!res.status) return;

        const d = res.data;

        /* USER */
        this.user = {
          name: d.user?.name || 'Member',
          member_id: d.member?.member_id || '4444-0000-0000',
          member_level: (d.member?.membership_level || 'Silver').toUpperCase() + ' MEMBER',
          total_point: Number(d.member?.active_points || 0),
          lifetime_point: Number(d.member?.lifetime_points || 0)
        };

        /* PRODUK */
        this.products = (d.products || []).map((p: any) => ({
          id: p.id,
          name: p.product_name,
          price: Number(p.price),
          point_price: Number(p.point_price),
          is_exchangeable: Number(p.is_exchangeable),
          image: p.image
            ? `${environment.apiBaseUrl}/uploads/products/${p.image}`
            : null
        }));

        /* ACTIVITY */
        this.recentActivities = (d.recent_transactions || []).map((t: any) => ({
          title: 'Transaction Completed',
          time: this.timeAgo(t.created_at),
          points: Number(t.total_point),
          icon: 'checkmark-circle-outline',
          iconBg: 'linear-gradient(145deg,#4ade80,#22c55e)'
        }));
      },
      error: () => {
        console.log('API ERROR');
      }
    });
  }

  /* ================= UTIL ================= */

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  }

  getAvatarGradient(): string {
    return 'linear-gradient(135deg, #059669, #10b981)';
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  getLevelColor(): string {
    const levels: any = {
      'SILVER MEMBER': 'linear-gradient(145deg,#334155,#1e293b)', // Soft Slate Black
      'GOLD MEMBER': 'linear-gradient(145deg,#10b981,#059669)',    // Emerald Base
      'PLATINUM MEMBER': 'linear-gradient(145deg,#1e293b,#0f172a)', // Deep Slate Base
      'DIAMOND MEMBER': 'linear-gradient(145deg,#0e7490,#155e75)'
    };
    return levels[this.user.member_level] || levels['SILVER MEMBER'];
  }

  formatPoints(points: number): string {
    return (points || 0).toLocaleString('en-US');
  }

  formatPrice(price: number): string {
    return (price || 0).toLocaleString('id-ID');
  }

  getProgress(): number {
    const p = this.user.lifetime_point || 0;
    if (p < 1000) return (p / 1000) * 100;
    if (p < 5000) return ((p - 1000) / 4000) * 100;
    if (p < 10000) return ((p - 5000) / 5000) * 100;
    return 100;
  }

  getNextLevel(): string {
    const p = this.user.lifetime_point || 0;
    if (p < 1000) return 'GOLD';
    if (p < 5000) return 'PLATINUM';
    if (p < 10000) return 'DIAMOND';
    return 'MAX LEVEL';
  }

  getNextLevelPoints(): number {
    const p = this.user.lifetime_point || 0;
    if (p < 1000) return 1000 - p;
    if (p < 5000) return 5000 - p;
    if (p < 10000) return 10000 - p;
    return 0;
  }

  timeAgo(date: string): string {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diff < 60) return diff + ' minutes ago';
    if (diff < 1440) return Math.floor(diff / 60) + ' hours ago';
    return Math.floor(diff / 1440) + ' days ago';
  }

}
