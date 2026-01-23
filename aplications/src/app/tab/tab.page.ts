import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from 'src/app/storage.service';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CapacitorHttp } from '@capacitor/core';



@Component({
  selector: 'app-tab',
  templateUrl: './tab.page.html',
  styleUrls: ['./tab.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, IonicModule, RouterModule],
})
export class TabPage implements OnInit {

  userData: any = null;
  userSign = this.storageService
  user_level: string = '';


  ngOnInit() {
    this.loadUserData();
    this.user_level = this.storageService.getUserLevel();
    this.cdr.detectChanges();
    this.refreshAllData();
  }

  ionViewWillEnter(): void {
    this.refreshAllData();
  }

  refreshAllData() {
    this.getCategories();
    this.getItems();
  }

  async getCategories() {
      try {
        const stored = localStorage.getItem('user_data');
        if (!stored) {
          console.error('User tidak ditemukan di localStorage');
          return;
        }
        const userData = JSON.parse(stored);
        const idOutlet = userData.userData.id_outlet;
        const response = await CapacitorHttp.post({
          url: 'https://epos.pringapus.com/api/v1/Product_category/getProductCategoryList',
          headers: { 'Content-Type': 'application/json' },
          data: { id_outlet: idOutlet }
        });
  
        if (Array.isArray(response.data.data)) {
          console.log('Kategori berhasil diambil:', response.data.data);
        } else {
          console.error('Data kategori tidak dalam format array:', response.data.data);
        }
      } catch (error) {
        console.error('Terjadi kesalahan saat mengambil kategori:', error);
      }
    }
  
    async getItems() {
      try {
        const stored = localStorage.getItem('user_data');
        if (!stored) {
          console.error('User tidak ditemukan di localStorage');
          return;
        }
        const userData = JSON.parse(stored);
        const idOutlet = userData.userData.id_outlet;
  
        const response = await CapacitorHttp.get({
          url: `https://epos.pringapus.com/api/v1/Product_category/get_products?id_outlet=${idOutlet}`,
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        console.log('Response API:', response.data);
  
        if (response.data && response.data.status) {
          console.log('Produk berhasil diambil:', response.data.data);
        } else {
          console.error('Data produk tidak ditemukan:', response.data.message);
        }
      } catch (error) {
        console.error('Terjadi kesalahan saat mengambil produk:', error);
      }
    }

  loadUserData() {
    const storedUserData = localStorage.getItem('user_data');
    if (storedUserData) {
      this.userData = JSON.parse(storedUserData);
      // this.username = this.userData.userData.username;
      this.user_level = this.userData.userData.member_level;
      console.log('✅ Membership Level:', this.user_level);

      // 🔥 Paksa Angular untuk update tampilan
      this.cdr.detectChanges();
    } else {
      console.log(' No user data found in localStorage');
    }
  }

  constructor(private router: Router, private storageService: StorageService, private cdr: ChangeDetectorRef,) {}

  ngAfterViewInit() {
    const tabs = document.querySelectorAll('ion-tab-button');

    const updateActiveTab = () => {
      const currentUrl = this.router.url; // Dapatkan URL saat ini
      tabs.forEach(tab => {
        if (currentUrl.includes(tab.getAttribute('tab') ?? '')) { // ✅ FIX ERROR
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
    };

    updateActiveTab(); // Set tab aktif saat aplikasi dibuka

    this.router.events.subscribe(() => {
      updateActiveTab(); // Update tab aktif setiap kali halaman berubah
    });
  }


}
