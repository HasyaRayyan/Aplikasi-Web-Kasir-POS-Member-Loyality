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
  meta: any = null;

  showAddModal = false;
  isEdit = false;
  editId: number | null = null;
groupNames: string[] = [];

  newAddon: any = {
    product_id: '',
    group_name: '',
    selection_type: 'single',
    addon_name: '',
    addon_price: 0,
    qty: 0
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

        console.log('RES:', res);

        let allAddons: any[] = [];

        // ===== CASE 1: BACKEND RETURN ADDON LANGSUNG =====
        if (Array.isArray(res.data) && res.data.length && res.data[0].addon_name) {
          allAddons = res.data;
        }

        // ===== CASE 2: BACKEND RETURN PRODUK + ADDONS =====
        else if (Array.isArray(res.data) && res.data.length && res.data[0].addons) {
          res.data.forEach((p: any) => {
            (p.addons || []).forEach((a: any) => {
              allAddons.push({
                id: a.id,
                addon_name: a.addon_name,
                addon_price: a.addon_price,
                qty: a.qty,
                product_name: p.product_name
              });
            });
          });
        }

        this.addons = allAddons;

        this.meta = res.meta ?? null;
        this.totalPages = res.meta?.total_pages ?? 1;

        // GROUP AUTO
        const groups = this.addons.map((a: any) =>
          a.addon_name.toLowerCase().includes('level') ? 'Level' : 'Topping'
        );

        this.groupNames = [...new Set(groups)];

        console.log('ADDONS FINAL:', this.addons);

        this.loading = false;
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

  // ================= MODAL =================
  openAddModal() {
    this.isEdit = false;
    this.showAddModal = true;

    this.newAddon = {
      product_id: '',
      group_name: '',
      selection_type: 'single',
      addon_name: '',
      addon_price: 0,
      qty: 0
    };
  }

  openEditModal(a: any) {
    this.isEdit = true;
    this.showAddModal = true;
    this.editId = a.id;

    this.newAddon = {
      product_id: a.product_id,
      group_name: a.group_name,
      selection_type: a.selection_type,
      addon_name: a.addon_name,
      addon_price: a.addon_price,
      qty: a.qty
    };
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
