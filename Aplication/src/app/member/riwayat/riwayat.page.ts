import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon,
  IonAccordionGroup, IonAccordion,
  IonItem, IonLabel,
  IonModal, IonDatetime, IonDatetimeButton
} from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { HomeService, RiwayatTransaction } from 'src/app/services/home.service';

import { 
  arrowBack, refreshOutline, star, calendarOutline, 
  calendarNumberOutline, receiptOutline, wallet, 
  card, chevronDown, flagOutline 
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-riwayat',
  templateUrl: './riwayat.page.html',
  styleUrls: ['./riwayat.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonIcon, IonAccordionGroup, IonAccordion,
    IonItem, IonLabel, IonModal, IonDatetime, IonDatetimeButton,
    CommonModule, FormsModule
  ]
})
export class RiwayatPage implements OnInit {

  allRiwayat: RiwayatTransaction[] = [];
  riwayat: RiwayatTransaction[] = [];
  loading = false;
  
  startDate: string = '';
  endDate: string = '';

  /* DASHBOARD SUMMARY */
  totalSpent: number = 0;
  earnedPoints: number = 0;

  constructor(
    private homeService: HomeService,
    private router: Router
  ) {
    addIcons({ 
      'arrow-back': arrowBack, 
      'refresh-outline': refreshOutline, 
      'star': star, 
      'calendar-outline': calendarOutline, 
      'calendar-number-outline': calendarNumberOutline, 
      'receipt-outline': receiptOutline, 
      'wallet': wallet, 
      'card': card, 
      'chevron-down': chevronDown, 
      'flag-outline': flagOutline 
    });
  }

  ngOnInit() {
    this.loadRiwayat();
  }

  goBack() {
    this.router.navigate(['/member/home']);
  }

  loadRiwayat() {
    const userId = Number(localStorage.getItem('user_id'));
    if (!userId) return;

    this.loading = true;

    this.homeService.getRiwayat(userId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.status) {
          this.allRiwayat = res.data;
          this.applyFilter();
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /* PRESETS */
  setToday() {
    const today = new Date().toISOString().split('T')[0];
    this.startDate = today;
    this.endDate = today;
    this.applyFilter();
  }

  setLast7Days() {
    const now = new Date();
    const last = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
    this.startDate = last;
    this.endDate = new Date().toISOString().split('T')[0];
    this.applyFilter();
  }

  setThisMonth() {
    const d = new Date();
    this.startDate = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    this.endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
    this.applyFilter();
  }

  setStartDate(ev: any) {
    const value = ev.detail.value;
    if (value) {
      this.startDate = (Array.isArray(value) ? value[0] : value).split('T')[0];
      this.applyFilter();
    }
  }

  setEndDate(ev: any) {
    const value = ev.detail.value;
    if (value) {
      this.endDate = (Array.isArray(value) ? value[0] : value).split('T')[0];
      this.applyFilter();
    }
  }

  applyFilter() {
    if (!this.startDate && !this.endDate) {
      this.riwayat = [...this.allRiwayat];
    } else {
      this.riwayat = this.allRiwayat.filter(trx => {
        const trxDate = trx.created_at.split(' ')[0];
        
        if (this.startDate && this.endDate) {
          return trxDate >= this.startDate && trxDate <= this.endDate;
        } else if (this.startDate) {
          return trxDate >= this.startDate;
        } else if (this.endDate) {
          return trxDate <= this.endDate;
        }
        return true;
      });
    }
    this.calculateSummary();
  }

  calculateSummary() {
    this.totalSpent = this.riwayat.reduce((acc, curr) => acc + Number(curr.total_price || 0), 0);
    this.earnedPoints = this.riwayat.reduce((acc, curr) => acc + Number(curr.total_point || 0), 0);
  }

  clearFilter() {
    this.startDate = '';
    this.endDate = '';
    this.riwayat = [...this.allRiwayat];
    this.calculateSummary();
  }

  formatPrice(v: any) {
    return Number(v || 0).toLocaleString('id-ID');
  }

  formatPoints(v: any) {
    return Number(v || 0).toLocaleString('en-US');
  }

  formatDateShort(v: string) {
    if (!v) return '-';
    const d = new Date(v);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  }

  formatDateLong(v: string) {
    if (!v) return '-';
    const d = new Date(v);
    return d.toLocaleString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

}
