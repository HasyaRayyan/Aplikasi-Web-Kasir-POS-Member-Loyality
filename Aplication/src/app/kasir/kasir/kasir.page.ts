import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from 'src/app/services/product.service';
import { KasirService } from 'src/app/services/kasir.service';


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
  allProducts: any[] = [];


  search = '';
  category = '';
  loading = true;

  page = 1;
  limit = 9;
  totalPages = 1;

  showTransactionModal = false;

memberPhone = '';
memberData: any = null;
memberLoading = false;


openTransactionModal() {
  if (this.cart.length === 0) {
    alert('Keranjang kosong');
    return;
  }

  this.showTransactionModal = true;
  this.memberPhone = '';
  this.memberData = null;
}
customerName = '';


  cacheProducts: any = {};

  searchTimeout: any;



  // ===== MODAL ADDON =====
  showAddonModal = false;
  selectedProduct: any = null;
tempSelectedAddons: any = {}; 

  constructor(private productService: ProductService, private kasirService: KasirService) {}

  

  ngOnInit() {
    this.loadKasir();
    this.loadAllProducts();
  }

  

  onSearchChange() {

  // reset ke page 1 setiap search
  this.page = 1;

  clearTimeout(this.searchTimeout);

  this.searchTimeout = setTimeout(() => {
    this.loadKasirLive();
  }, 300); // 300ms debounce
}

loadAllProducts() {
  this.productService
    .getKasir('', '', 1, 9999) // limit besar
    .subscribe(res => {
      this.allProducts = res.products;
    });
}



loadKasirLive() {
  const key = this.makeCacheKey();

  // CEK CACHE
  if (this.cacheProducts[key]) {
    const cached = this.cacheProducts[key];
    this.products = cached.products;
    this.totalPages = cached.totalPages;
    return;
  }

  this.productService
    .getKasir(this.search, this.category, this.page, this.limit)
    .subscribe(res => {

      this.products = res.products;
      this.totalPages = res.meta.total_pages || 1;

      // simpan cache
      this.cacheProducts[key] = {
        products: res.products,
        totalPages: this.totalPages
      };
    });
}


  makeCacheKey() {
    return `${this.search}_${this.category}_${this.page}_${this.limit}`;
  }

  // ================= LOAD DATA =================
loadKasir() {
  const key = this.makeCacheKey();

  // ==== CEK CACHE ====
  if (this.cacheProducts[key]) {
    const cached = this.cacheProducts[key];
    this.products = cached.products;
    this.categories = cached.categories;
    this.totalPages = cached.totalPages;
    this.loading = false;
    return;
  }

  // ==== JIKA BELUM ADA CACHE ====
  this.loading = true;

  this.productService
    .getKasir(this.search, this.category, this.page, this.limit)
    .subscribe(res => {

      // ==== SORT PRODUK ====
      const sortedProducts = res.products.sort((a: any, b: any) => {
        const stockA = Number(a.qty);
        const stockB = Number(b.qty);

        // stok ada di atas
        if (stockA === 0 && stockB > 0) return 1;
        if (stockA > 0 && stockB === 0) return -1;

        // kalau sama-sama ada stok / sama-sama habis → urut nama
        return a.product_name.localeCompare(b.product_name);
      });

      this.products = sortedProducts;
      this.categories = res.categories;
      this.totalPages = res.meta.total_pages || 1;

      // ==== SIMPAN KE CACHE (SUDAH SORT) ====
      this.cacheProducts[key] = {
        products: sortedProducts,
        categories: res.categories,
        totalPages: this.totalPages
      };

      this.loading = false;
    });
}


  // ================= CLICK PRODUK =================
  addToCart(p: any) {
    if (p.qty <= 0) {
      alert('Stok habis');
      return;
    }

    if (p.addons && p.addons.length > 0) {
      this.selectedProduct = p;
this.tempSelectedAddons = {};
      this.showAddonModal = true;
      return;
    }

    this.pushToCart(p, []);
  }


  // ================= PUSH CART =================
pushToCart(p: any, addons: any[]) {

  // ==== CEK STOK ====
  if (p.qty <= 0) {
    alert('Stok habis');
    return;
  }

  // ==== KURANGI STOK PRODUK ====
  p.qty = Number(p.qty) - 1;

  // ==== KURANGI STOK ADDON ====
addons.forEach(a => {
  a.qty = Number(a.qty) - 1;
});


  const addonKey = this.makeAddonKey(addons);

  const found = this.cart.find(
    x => x.id === p.id && x.addonKey === addonKey
  );

  const addonTotal = addons.reduce(
    (a, b) => a + Number(b.addon_price),
    0
  );

  // ==== JIKA SUDAH ADA DI CART ====
  if (found) {
    found.qty++;
    this.recalcSubtotal(found);
    return;
  }

  // ==== JIKA BELUM ADA ====
  const newItem = {
    id: p.id,
    product_name: p.product_name,
    price: p.price,
    image: p.image,
    category_name: p.category_name,

    qty: 1,
    selectedAddons: [...addons], // clone
    addonKey: addonKey,
    subtotal: Number(p.price) + addonTotal
  };

  this.cart.push(newItem);
}


  // ================= MODAL ADDON =================
toggleTempAddon(group: any, item: any) {

  if (item.qty <= 0) {
    alert('Stok addon habis');
    return;
  }

  const groupName = group.group_name;

  if (!this.tempSelectedAddons[groupName]) {
    this.tempSelectedAddons[groupName] = [];
  }

  // SINGLE
  if (group.selection_type === 'single') {
    this.tempSelectedAddons[groupName] = [item];
    return;
  }

  // MULTIPLE
  const idx = this.tempSelectedAddons[groupName]
    .findIndex((x: any) => x.id === item.id);

  if (idx > -1) {
    this.tempSelectedAddons[groupName].splice(idx, 1);
  } else {
    this.tempSelectedAddons[groupName].push(item);
  }
}



isTempAddonSelected(group: any, item: any) {
  const list = this.tempSelectedAddons[group.group_name] || [];
  return list.some((x: any) => x.id === item.id);
}

confirmAddon() {

  const flatAddons: any[] = Object.values(this.tempSelectedAddons)
    .reduce((acc: any[], val: any) => {
      return acc.concat(val);
    }, []);

  this.pushToCart(this.selectedProduct, flatAddons);
  this.closeAddonModal();
}


  skipAddon() {
    this.pushToCart(this.selectedProduct, []);
    this.closeAddonModal();
  }

closeAddonModal() {
  this.showAddonModal = false;
  this.selectedProduct = null;
  this.tempSelectedAddons = {};
}


  // ================= CART =================
removeItem(c: any) {

  const prod = this.products.find(p => p.id === c.id);
  if (prod) prod.qty += c.qty;

  // BALIKIN ADDON
  c.selectedAddons?.forEach((a: any) => {
    const prod2 = this.products.find(p => p.id === c.id);
    const addon = prod2?.addons?.find((x: any) => x.id === a.id);
    if (addon) addon.qty += c.qty;
  });

  this.cart = this.cart.filter(x => x !== c);
}


plusQty(c: any) {

  const prod = this.products.find(p => p.id === c.id);
  if (!prod || prod.qty <= 0) {
    alert('Stok habis');
    return;
  }

  // CEK ADDON STOK
  for (let a of c.selectedAddons || []) {
    if (a.qty <= 0) {
      alert('Stok addon habis');
      return;
    }
  }

  prod.qty--;

  // KURANGI ADDON
  c.selectedAddons?.forEach((a: any) => a.qty--);

  c.qty++;
  this.recalcSubtotal(c);
}



minusQty(c: any) {
  if (c.qty > 1) {

    const prod = this.products.find(p => p.id === c.id);
    if (prod) prod.qty++;

    c.selectedAddons?.forEach((a: any) => a.qty++);

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


  get outOfStockProducts() {
    return this.allProducts.filter(p => Number(p.qty) === 0);
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

  this.cart.forEach(c => {

    const prod = this.products.find(p => p.id === c.id);
    if (prod) prod.qty += c.qty;

    c.selectedAddons?.forEach((a: any) => {
      const addon = prod?.addons?.find((x: any) => x.id === a.id);
      if (addon) addon.qty += c.qty;
    });

  });

  this.cart = [];
}


searchMember() {
  if (!this.memberPhone) return;

  this.memberLoading = true;

  this.kasirService.findMember(this.memberPhone)
    .subscribe((res: any) => {

      this.memberData = res.data || null;

      if (this.memberData) {
        this.customerName = this.memberData.name;
      }

      this.memberLoading = false;
    });
}




processTransaction() {

  if (this.cart.length === 0) return;

  const payload = {
    cart: this.cart,
    total: this.total,
    customer_name: this.customerName || null,
    member_id: this.memberData?.member_id || null
  };

  this.kasirService.createTransaction(payload)
    .subscribe(() => {

      alert('Transaksi berhasil');

      this.cart = [];
      this.customerName = '';
      this.memberPhone = '';
      this.memberData = null;

      this.loadKasir();

    });
}




closeTransactionModal() {
  this.showTransactionModal = false;
  this.memberPhone = '';
  this.memberData = null;
}

clearMember() {
  this.memberData = null;
  this.memberPhone = '';
  this.customerName = '';
}




}
