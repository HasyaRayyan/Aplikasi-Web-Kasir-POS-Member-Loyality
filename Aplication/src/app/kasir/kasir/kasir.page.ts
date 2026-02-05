import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-kasir',
  standalone: true,
  templateUrl: './kasir.page.html',
  styleUrls: ['./kasir.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class KasirPage implements OnInit {

  products: any[] = [];
  categories: any[] = [];
  cart: any[] = [];

  search = '';
  category = '';
  loading = true;

  page = 1;
  limit = 9;
  totalPages = 1;

  // ===== MODAL ADDON =====
  showAddonModal = false;
  selectedProduct: any = null;
  tempSelectedAddons: any[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadKasir();
  }

  // ================= LOAD DATA =================
  loadKasir() {
    this.loading = true;

    this.productService
      .getKasir(this.search, this.category, this.page, this.limit)
      .subscribe(res => {
        this.products = res.products;
        this.categories = res.categories;
        this.totalPages = res.meta.total_pages || 1;
        this.loading = false;
      });
  }

  // ================= CLICK PRODUK =================
  addToCart(p: any) {
    if (p.addons && p.addons.length > 0) {
      this.selectedProduct = p;
      this.tempSelectedAddons = [];
      this.showAddonModal = true;
      return;
    }

    this.pushToCart(p, []);
  }

  // ================= PUSH CART =================
  pushToCart(p: any, addons: any[]) {

    const addonKey = this.makeAddonKey(addons);

    const found = this.cart.find(
      x => x.id === p.id && x.addonKey === addonKey
    );

    const addonTotal = addons.reduce(
      (a, b) => a + Number(b.addon_price),
      0
    );

    if (found) {
      found.qty++;
      this.recalcSubtotal(found);
      return;
    }

    const newItem = {
      ...p,
      qty: 1,
      selectedAddons: [...addons], // ⬅️ clone biar tidak nempel reference
      addonKey: addonKey,
      subtotal: Number(p.price) + addonTotal
    };

    this.cart.push(newItem);
  }

  // ================= MODAL ADDON =================
  toggleTempAddon(a: any) {
    const idx = this.tempSelectedAddons.findIndex(x => x.id === a.id);

    if (idx > -1) {
      this.tempSelectedAddons.splice(idx, 1);
    } else {
      this.tempSelectedAddons.push(a);
    }
  }

  isTempAddonSelected(a: any) {
    return this.tempSelectedAddons.some(x => x.id === a.id);
  }

  confirmAddon() {
    this.pushToCart(this.selectedProduct, this.tempSelectedAddons);
    this.closeAddonModal();
  }

  skipAddon() {
    this.pushToCart(this.selectedProduct, []);
    this.closeAddonModal();
  }

  closeAddonModal() {
    this.showAddonModal = false;
    this.selectedProduct = null;
    this.tempSelectedAddons = [];
  }

  // ================= CART =================
  removeItem(c: any) {
    this.cart = this.cart.filter(x => x !== c);
  }

  plusQty(c: any) {
    c.qty++;
    this.recalcSubtotal(c);
  }

  minusQty(c: any) {
    if (c.qty > 1) {
      c.qty--;
      this.recalcSubtotal(c);
    }
  }

  recalcSubtotal(c: any) {
    const addonTotal = (c.selectedAddons || []).reduce(
      (a: number, b: any) => a + Number(b.addon_price),
      0
    );

    c.subtotal = (Number(c.price) + addonTotal) * c.qty;
  }

  // ================= TOTAL =================
  get total() {
    return this.cart.reduce((a, b) => a + Number(b.subtotal), 0);
  }

  formatPrice(v: number | string) {
    return Number(v).toLocaleString('id-ID');
  }

  // ================= ADDON KEY =================
  makeAddonKey(addons: any[]): string {
    if (!addons || addons.length === 0) return 'no-addon';
    return addons
      .map(a => a.id)
      .sort()
      .join('-');
  }

  // ================= PAGINATION =================
  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadKasir();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadKasir();
    }
  }

  setCategory(id: any) {
    this.category = id;
    this.page = 1;
    this.loadKasir();
  }

clearCart() {
  if (this.cart.length === 0) return;

  const confirmClear = confirm('Yakin ingin menghapus semua keranjang?');
  if (!confirmClear) return;

  this.cart = [];
}



}
