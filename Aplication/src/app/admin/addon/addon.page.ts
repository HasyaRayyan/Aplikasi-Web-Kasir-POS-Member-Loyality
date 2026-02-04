import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';

import { AddonService } from 'src/app/services/addon.service';
import { ProductService } from 'src/app/services/product.service'; // ⬅️ WAJIB

@Component({
  selector: 'app-addon',
  templateUrl: './addon.page.html',
  styleUrls: ['./addon.page.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    IonIcon,
    CommonModule,
    FormsModule
  ]
})
export class AddonPage implements OnInit {

  addons: any[] = [];
  productsList: any[] = [];

  page = 1;
  limit = 10;
  totalPages = 1;
  loading = true;

  search = '';
  filterProduct = '';
  uniqueProducts: string[] = [];
  meta: any = null;

  showAddModal = false;
  isEdit = false;
  editId: number | null = null;

  newAddon: any = {
    product_id: '',
    addon_name: '',
    addon_price: 0,
    qty: 0,
    is_active: 1,
    addon_type: 'optional',
    description: ''
  };

  constructor(
    private addonService: AddonService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadData();
  }

  loadData() {
    this.loading = true;

    this.addonService.getAddons(this.page, this.limit, this.search)
      .subscribe({
        next: (res: any) => {
          this.addons = res.data ?? [];
          this.meta = res.meta;
          this.totalPages = res.meta?.total_pages ?? 1;
          this.loading = false;

          // unique produk untuk filter
          this.uniqueProducts = [
            ...new Set(this.addons.map((a: any) => a.product_name))
          ];
        },
        error: () => this.loading = false
      });
  }

  loadProducts() {
    this.productService.getProducts(1, 999, '')
      .subscribe((res: any) => {
        this.productsList = res.data ?? [];
      });
  }

  openAddModal() {
    this.isEdit = false;
    this.showAddModal = true;

    this.newAddon = {
      product_id: '',
      addon_name: '',
      addon_price: 0,
      qty: 0,
      is_active: 1,
      addon_type: 'optional',
      description: ''
    };
  }
openEditModal(a: any) {
  this.isEdit = true;
  this.showAddModal = true;
  this.editId = a.id;

  // cari produk berdasarkan nama
  const foundProduct = this.productsList.find(
    p => p.product_name === a.product_name
  );

  this.newAddon = {
    addon_name: a.addon_name,
    addon_price: a.addon_price,
    qty: a.qty,
    is_active: 1,
    addon_type: 'optional',
    description: '',

    // ambil id dari hasil pencarian
    product_id: foundProduct ? foundProduct.id : ''
  };

  console.log('FOUND PRODUCT:', foundProduct);
}


  closeAddModal() {
    this.showAddModal = false;
    this.isEdit = false;
    this.editId = null;
  }

  saveAddon() {
    this.addonService.createAddon(this.newAddon).subscribe(() => {
      this.closeAddModal();
      this.loadData();
    });
  }

  updateAddon() {
    if (!this.editId) return;

    this.addonService.updateAddon(this.editId, this.newAddon).subscribe(() => {
      this.closeAddModal();
      this.loadData();
    });
  }

  confirmDelete(id: number) {
    if (confirm('Yakin hapus addon?')) {
      this.deleteAddon(id);
    }
  }

  deleteAddon(id: number) {
    this.addonService.deleteAddon(id).subscribe(() => {
      this.loadData();
    });
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadData();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadData();
    }
  }

  formatPrice(v: string) {
    return Number(v).toLocaleString('id-ID');
  }
}
