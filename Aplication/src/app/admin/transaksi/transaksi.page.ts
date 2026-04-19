import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonIcon, IonSpinner 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  documents, search, folderOpen, receipt, 
  chevronBack, chevronForward, close, cube 
} from 'ionicons/icons';
import { KasirService } from 'src/app/services/kasir.service';

@Component({
  selector: 'app-admin-transaksi',
  templateUrl: './transaksi.page.html',
  styleUrls: ['./transaksi.page.scss'],
  standalone: true,
  imports: [
    IonIcon, IonSpinner,
    CommonModule, FormsModule
  ]
})
export class AdminTransaksiPage implements OnInit {

  histories: any[] = [];
  loading = false;

  search = '';
  lastSearch = '';

  page = 1;
  firstLoad = true;

  totalPages = 1;

  showDetailModal = false;
  selectedHistory: any = null;

  // ===== CACHE =====
  cache: any = {};

  // ===== SEARCH TIMER =====
  searchTimeout: any;

  constructor(private kasirService: KasirService) {
    addIcons({ 
      'documents': documents, 
      'search': search, 
      'folder-open': folderOpen, 
      'receipt': receipt, 
      'chevron-back': chevronBack, 
      'chevron-forward': chevronForward, 
      'close': close, 
      'cube': cube 
    });
  }

  ngOnInit() {
    this.loadData();
  }

  // ================= LOAD DATA =================
  loadData() {
    if (this.firstLoad) {
      this.loading = true;
    }

    this.kasirService.getHistory(this.page, this.search)
      .subscribe((res:any) => {
        this.histories = res.data || [];
        this.totalPages = res.meta?.total_pages || 1;
        this.loading = false;
        this.firstLoad = false;
      });
  }

  // ================= AUTO SEARCH =================
  onSearchChange() {

    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {

      const value = this.search.trim();

      // ==== JIKA SAMA DENGAN SEBELUMNYA ====
      if (value === this.lastSearch) return;

      // ==== JIKA KURANG DARI 2 HURUF DAN BUKAN KOSONG ====
      if (value.length < 2 && value !== '') return;

      this.lastSearch = value;
      this.page = 1;

      this.loadData();

    }, 400); // bisa 400–500 biar lebih smooth
  }

  // ================= PAGINATION =================
  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadData();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadData();
    }
  }

  // ================= DETAIL =================
  openDetail(h: any) {
    this.selectedHistory = h;
    this.showDetailModal = true;
  }

  closeDetail() {
    this.showDetailModal = false;
    this.selectedHistory = null;
  }

  formatPrice(v: any) {
    return Number(v).toLocaleString('id-ID');
  }
}
