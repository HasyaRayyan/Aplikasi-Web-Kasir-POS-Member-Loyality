import { Component, OnInit } from '@angular/core';
import { 
  IonIcon, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  receiptOutline, searchOutline, alertOutline, star, 
  addOutline, chevronBackOutline, chevronForwardOutline, 
  cartOutline, trashOutline, closeCircle, giftOutline, 
  closeOutline, radioButtonOnOutline, checkboxOutline,
  personOutline, callOutline
} from 'ionicons/icons';
import { ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from 'src/app/services/product.service';
import { KasirService } from 'src/app/services/kasir.service';
import { LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'app-kasir',
  standalone: true,
  templateUrl: './kasir.page.html',
  styleUrls: ['./kasir.page.scss'],
  imports: [
    IonIcon, IonSpinner,
    CommonModule, FormsModule, LottieComponent
  ]
})
export class KasirPage implements OnInit {

  products: any[] = [];
  categories: any[] = [];
  cart: any[] = [];
  allProducts: any[] = [];

  paymentMethod = 'cash'; // default
  cashPaid: number = 0;
  cashPaidDisplay: string = '';
  change: number = 0;

  showPaymentModal = false;
  search = '';
  category = '';
  loading = true;
  filterStatus = 'all'; // 'all', 'available', 'sold'

  page = 1;
  limit = 9;
  totalPages = 1;

  showTransactionModal = false;
  showSuccessModal = false;

  memberPhone = '';
  memberData: any = null;
  memberLoading = false;
  redemptions: any[] = [];

  pointRule: any = null;
  estimatedPoint = 0;

  customerName = '';

  cacheProducts: any = {};
  searchTimeout: any;

  lottieOptions = {
    path: '/assets/success.json',
    autoplay: true,
    loop: false
  };

  showAddonModal = false;
  selectedProduct: any = null;
  tempSelectedAddons: any = {}; 

  constructor(
    private productService: ProductService, 
    private kasirService: KasirService,
    private toastCtrl: ToastController
  ) {
    addIcons({ 
      'receipt-outline': receiptOutline, 
      'search-outline': searchOutline, 
      'alert-outline': alertOutline, 
      star, 
      'add-outline': addOutline, 
      'chevron-back-outline': chevronBackOutline, 
      'chevron-forward-outline': chevronForwardOutline, 
      'cart-outline': cartOutline, 
      'trash-outline': trashOutline, 
      'close-circle': closeCircle, 
      'gift-outline': giftOutline, 
      'close-outline': closeOutline, 
      'radio-button-on-outline': radioButtonOnOutline, 
      'checkbox-outline': checkboxOutline,
      'person-outline': personOutline,
      'call-outline': callOutline
    });
  }

  async showToast(msg: string, color: string = 'danger') {
    const t = await this.toastCtrl.create({
      message: msg, duration: 2500, color: color, position: 'top', mode: 'ios'
    });
    t.present();
  }

  ngOnInit() {
    this.loadKasir();
    this.loadAllProducts();
    this.loadPointRule();
  }

  calculateChange() {
    const bayar = Number(this.cashPaid) || 0;
    const total = this.total;
    this.change = bayar - total;
    if (this.change < 0) this.change = 0;
  }

  onCashPaidInput(event: any) {
    let val = event.target.value;
    
    // 1. Bersihkan karakter non-digit
    val = val.replace(/\D/g, '');
    
    // 2. Simpan nilai aslinya (angka)
    this.cashPaid = val ? parseInt(val, 10) : 0;
    
    // 3. Format tampilannya dengan titik
    if (this.cashPaid === 0) {
      this.cashPaidDisplay = '';
    } else {
      this.cashPaidDisplay = this.formatPrice(this.cashPaid);
    }
    
    this.calculateChange();
  }

  setPayment(method: string) {
    this.paymentMethod = method;
    this.cashPaid = 0;
    this.cashPaidDisplay = '';
    this.change = 0;
  }

  openTransactionModal() {
    if (this.cart.length === 0) {
      this.showToast('Keranjang masih kosong!');
      return;
    }
    this.showTransactionModal = true;
    this.memberPhone = '';
    this.memberData = null;
  }

  loadPointRule() {
    this.kasirService.getActivePointRule()
      .subscribe((res: any) => {
        this.pointRule = res.data || null;
        this.calculatePoint();
      });
  }

  calculatePoint() {
    if (!this.pointRule || !this.memberData) {
      this.estimatedPoint = 0;
      return;
    }
    const amountPerPoint = Number(this.pointRule.amount_per_point);
    const pointValue = Number(this.pointRule.point_value);
    const totalBelanja = this.total;
    if (totalBelanja <= 0) {
      this.estimatedPoint = 0;
      return;
    }
    const multiplier = Math.floor(totalBelanja / amountPerPoint);
    this.estimatedPoint = multiplier * pointValue;
  }

  onSearchChange() {
    this.page = 1;
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadKasirLive();
    }, 300);
  }

  loadAllProducts() {
    this.productService
      .getKasir('', '', 1, 9999)
      .subscribe(res => {
        this.allProducts = res.products;
      });
  }

  loadKasirLive() {
    const key = this.makeCacheKey();
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
        this.cacheProducts[key] = {
          products: res.products,
          totalPages: this.totalPages
        };
      });
  }

  makeCacheKey() {
    return `${this.search}_${this.category}_${this.page}_${this.limit}`;
  }

  loadKasir() {
    const key = this.makeCacheKey();
    if (this.cacheProducts[key]) {
      const cached = this.cacheProducts[key];
      this.products = cached.products;
      this.categories = cached.categories;
      this.totalPages = cached.totalPages;
      this.loading = false;
      return;
    }
    this.loading = true;
    this.productService
      .getKasir(this.search, this.category, this.page, this.limit)
      .subscribe(res => {
        const sortedProducts = res.products.sort((a: any, b: any) => {
          const stockA = Number(a.qty);
          const stockB = Number(b.qty);
          if (stockA === 0 && stockB > 0) return 1;
          if (stockA > 0 && stockB === 0) return -1;
          return a.product_name.localeCompare(b.product_name);
        });
        this.products = sortedProducts;
        this.categories = res.categories;
        this.totalPages = res.meta.total_pages || 1;
        this.cacheProducts[key] = {
          products: sortedProducts,
          categories: res.categories,
          totalPages: this.totalPages
        };
        this.loading = false;
      });
  }

  addToCart(p: any) {
    if (p.qty <= 0) {
      this.showToast('Gagal! Stok habis');
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

  pushToCart(p: any, addons: any[]) {
    if (p.qty <= 0) {
      this.showToast('Gagal! Stok habis');
      return;
    }
    p.qty = Number(p.qty) - 1;
    addons.forEach(a => { a.qty = Number(a.qty) - 1; });
    const addonKey = this.makeAddonKey(addons);
    const found = this.cart.find(x => x.id === p.id && x.addonKey === addonKey);
    const addonTotal = addons.reduce((a, b) => a + Number(b.addon_price), 0);
    if (found) {
      found.qty++;
      this.recalcSubtotal(found);
      this.calculatePoint();
      this.calculateChange();
      return;
    }
    const newItem = {
      id: p.id,
      product_name: p.product_name,
      price: p.price,
      image: p.image,
      category_name: p.category_name,
      qty: 1,
      selectedAddons: [...addons],
      addonKey: addonKey,
      subtotal: Number(p.price) + addonTotal
    };
    this.cart.push(newItem);
    this.calculatePoint();
    this.calculateChange();
  }

  toggleTempAddon(group: any, item: any) {
    if (item.qty <= 0) {
      this.showToast('Gagal! Stok opsi tambahan habis', 'warning');
      return;
    }
    const groupName = group.group_name;
    if (!this.tempSelectedAddons[groupName]) {
      this.tempSelectedAddons[groupName] = [];
    }
    if (group.selection_type === 'single') {
      this.tempSelectedAddons[groupName] = [item];
      return;
    }
    const idx = this.tempSelectedAddons[groupName].findIndex((x: any) => x.id === item.id);
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
    if (this.selectedProduct?.addons) {
      for (const group of this.selectedProduct.addons) {
        if (group.is_required) {
          const selected = this.tempSelectedAddons[group.group_name];
          if (!selected || selected.length === 0) {
            this.showToast(`Opsi "${group.group_name}" wajib dipilih!`, 'warning');
            return;
          }
        }
      }
    }
    const flatAddons: any[] = Object.values(this.tempSelectedAddons).reduce((acc: any[], val: any) => acc.concat(val), []);
    this.pushToCart(this.selectedProduct, flatAddons);
    this.closeAddonModal();
  }

  skipAddon() {
    if (this.selectedProduct?.addons) {
      for (const group of this.selectedProduct.addons) {
        if (group.is_required) {
          this.showToast(`Opsi "${group.group_name}" wajib dipilih!`, 'warning');
          return;
        }
      }
    }
    this.pushToCart(this.selectedProduct, []);
    this.closeAddonModal();
  }

  closeAddonModal() {
    this.showAddonModal = false;
    this.selectedProduct = null;
    this.tempSelectedAddons = {};
  }

  removeItem(c: any) {
    if (c.is_redemption) {
      if (c.redemption_original) {
        this.redemptions.push(c.redemption_original);
      }
    } else {
      const prod = this.allProducts.find(p => p.id === c.id);
      if (prod) prod.qty += c.qty;
      c.selectedAddons?.forEach((a: any) => {
        const addon = prod?.addons?.find((x: any) => x.id === a.id);
        if (addon) addon.qty += c.qty;
      });
    }
    this.cart = this.cart.filter(x => x !== c);
    this.calculatePoint();
    this.calculateChange();
  }

  plusQty(c: any) {
    if (c.is_redemption) {
      this.showToast('Item penukaran poin tidak dapat ditambah jumlahnya', 'warning');
      return;
    }
    const prod = this.allProducts.find(p => p.id === c.id);
    if (!prod || prod.qty <= 0) {
      this.showToast('Gagal! Stok habis');
      return;
    }
    for (let a of c.selectedAddons || []) {
      if (a.qty <= 0) {
        this.showToast('Gagal! Stok opsi tambahan habis', 'warning');
        return;
      }
    }
    prod.qty--;
    c.selectedAddons?.forEach((a: any) => a.qty--);
    c.qty++;
    this.recalcSubtotal(c);
    this.calculatePoint();
    this.calculateChange();
  }

  minusQty(c: any) {
    if (c.is_redemption) return;
    if (c.qty > 1) {
      const prod = this.allProducts.find(p => p.id === c.id);
      if (prod) prod.qty++;
      c.selectedAddons?.forEach((a: any) => a.qty++);
      c.qty--;
      this.recalcSubtotal(c);
      this.calculatePoint();
      this.calculateChange();
    }
  }

  claimItem(r: any) {
    const product = this.allProducts.find(p => p.id == r.product_id);
    if (!product) {
      this.showToast('Data produk tidak ditemukan di kasir', 'danger');
      return;
    }
    const cartItem = {
      id: product.id,
      product_name: `[REDEEM] ${product.product_name}`,
      price: 0,
      qty: 1,
      subtotal: 0,
      selectedAddons: [],
      is_redemption: true,
      redemption_id: r.id,
      redemption_original: r
    };
    this.cart.push(cartItem);
    this.redemptions = this.redemptions.filter(x => x.id !== r.id);
    this.showToast(`${product.product_name} masuk ke keranjang (Rp 0)`, 'success');
    this.calculateChange();
  }

  recalcSubtotal(c: any) {
    if (c.is_redemption) {
      c.subtotal = 0;
      return;
    }
    const addonTotal = (c.selectedAddons || []).reduce((a: number, b: any) => a + Number(b.addon_price), 0);
    c.subtotal = (Number(c.price) + addonTotal) * c.qty;
  }

  get total() {
    return this.cart.reduce((a, b) => a + Number(b.subtotal), 0);
  }

  recalculateAll() {
    this.calculatePoint();
  }

  formatPrice(v: number | string) {
    return Number(v).toLocaleString('id-ID');
  }

  get outOfStockProducts() {
    return this.allProducts.filter(p => Number(p.qty) === 0);
  }

  makeAddonKey(addons: any[]): string {
    if (!addons || addons.length === 0) return 'no-addon';
    return addons.map(a => a.id).sort().join('-');
  }

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
  setFilterStatus(status: string) {
    this.filterStatus = status;
    if (status === 'all') {
      this.loadKasir();
    } else if (status === 'available') {
      this.products = this.allProducts.filter(p => Number(p.qty) > 0);
    } else if (status === 'sold') {
      this.products = this.allProducts.filter(p => Number(p.qty) === 0);
    }
  }

  solditem() {
    this.setFilterStatus('sold');
  }

  availableitem() {
    this.setFilterStatus('available');
  }

  clearCart() {
    if (this.cart.length === 0) return;
    const confirmClear = confirm('Yakin ingin menghapus semua keranjang?');
    if (!confirmClear) return;
    this.cart.forEach(c => {
      if (!c.is_redemption) {
        const prod = this.allProducts.find(p => p.id === c.id);
        if (prod) prod.qty += c.qty;
        c.selectedAddons?.forEach((a: any) => {
          const addon = prod?.addons?.find((x: any) => x.id === a.id);
          if (addon) addon.qty += c.qty;
        });
      } else if (c.redemption_original) {
        this.redemptions.push(c.redemption_original);
      }
    });
    this.cart = [];
    this.calculateChange();
  }

  searchMember() {
    if (!this.memberPhone) return;
    
    const phone = this.memberPhone.trim();
    if (phone.length < 10 || phone.length > 14) {
      this.showToast('Nomor HP Member harus 10 - 14 digit', 'warning');
      return;
    }

    this.memberLoading = true;
    this.kasirService.findMember(this.memberPhone)
      .subscribe((res: any) => {
        this.memberData = res.data || null;
        const inCartIds = this.cart.filter(x => x.is_redemption).map(x => x.redemption_id);
        this.redemptions = (res.redemptions || []).filter((r: any) => !inCartIds.includes(r.id));
        if (this.memberData) {
          this.customerName = this.memberData.name;
          this.calculatePoint();
        }
        this.memberLoading = false;
      }, () => {
        this.memberLoading = false;
      });
  }

  processTransaction() {
    if (this.cart.length === 0 || !this.validateCustomer()) return;
    if (this.paymentMethod === 'cash' && this.cashPaid < this.total) {
      this.showToast('Gagal! Uang pembayaran kurang dari total tagihan.', 'danger');
      return;
    }
    const payload = {
      cart: this.cart,
      total: this.total,
      customer_name: this.customerName || 'Umum',
      member_id: this.memberData?.member_id || null,
      estimated_point: this.estimatedPoint,
      payment_method: this.paymentMethod,
      cash_paid: this.paymentMethod === 'cash' ? this.cashPaid : 0,
      change_money: this.paymentMethod === 'cash' ? this.change : 0
    };
    this.kasirService.createTransaction(payload).subscribe(() => {
      this.showToast('Transaksi berhasil disimpan!', 'success');
      this.resetAfterTransaction();
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
    this.calculatePoint();
  }

  onCustomerNameChange() {
    if (this.memberData) {
      this.memberData = null;
      this.memberPhone = '';
    }
  }

  validateCustomer() {
    if (!this.memberData && !this.customerName) {
      this.showToast('Gagal! Masukkan nama pelanggan terlebih dahulu.', 'warning');
      return false;
    }
    return true;
  }

  openPaymentModal() {
    if (this.cart.length === 0 || !this.validateCustomer()) return;
    if (this.paymentMethod === 'cash' && this.cashPaid < this.total) {
      this.showToast('Gagal! Uang pembayaran kurang.', 'danger');
      return;
    }
    this.showPaymentModal = true;
  }

  confirmPayment() {
    const payload = {
      cart: this.cart,
      total: this.total,
      customer_name: this.customerName || 'Umum',
      member_id: this.memberData?.member_id || null,
      estimated_point: this.estimatedPoint,
      payment_method: this.paymentMethod,
      cash_paid: this.paymentMethod === 'cash' ? this.cashPaid : 0,
      change_money: this.paymentMethod === 'cash' ? this.change : 0
    };
    this.kasirService.createTransaction(payload).subscribe((res: any) => {
      this.printStruk(res);
      this.showPaymentModal = false;
      this.showSuccessModal = true;
      setTimeout(() => {
        this.showSuccessModal = false;
        this.resetAfterTransaction();
      }, 5000);
    });
  }

  printStruk(res: any) {
    const win = window.open('', '', 'width=380,height=650');
    const date = new Date().toLocaleString('id-ID');
    const trxId = res?.transaction_id || Math.floor(Math.random() * 999999);
    let itemsHtml = '';
    this.cart.forEach(c => {
      itemsHtml += `
        <div class="item">
          <div class="row bold">
            <span>${c.product_name}</span>
            <span>Rp ${this.formatPrice(c.price)}</span>
          </div>
          <div class="row small">
            <span>Qty ${c.qty}</span>
            <span>Rp ${this.formatPrice(c.subtotal)}</span>
          </div>`;
      if (c.selectedAddons?.length) {
        c.selectedAddons.forEach((a: any) => {
          itemsHtml += `
            <div class="row addon">
              <span>+ ${a.addon_name}</span>
              <span>Rp ${this.formatPrice(a.addon_price * c.qty)}</span>
            </div>`;
        });
      }
      itemsHtml += `</div>`;
    });
    win!.document.write(`
    <html>
      <head>
        <title>Struk</title>
        <style>
          body { font-family: 'Courier New', monospace; width: 300px; margin: auto; font-size: 12px; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .small { font-size: 11px; color:#555; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .row { display: flex; justify-content: space-between; margin: 2px 0; }
          .addon { font-size: 11px; color: #666; padding-left: 10px; }
          .item { margin-bottom: 6px; }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size:16px;">THE FOURTYFOUR</div>
        <div class="center small">Cafe & Cloth <br/> Jl. P. Rohjoyo Banaran Bumiaji <br/> Kota Batu – Jawa Timur</div>
        <div class="divider"></div>
        <div class="row small"><span>Trx</span><span>#${trxId}</span></div>
        <div class="row small"><span>Tanggal</span><span>${date}</span></div>
        <div class="row small"><span>Pelanggan</span><span>${this.customerName || 'Umum'}</span></div>
        <div class="divider"></div>
        ${itemsHtml}
        <div class="divider"></div>
        <div class="row bold"><span>TOTAL</span><span>Rp ${this.formatPrice(this.total)}</span></div>
        <div class="row"><span>Metode</span><span>${this.paymentMethod.toUpperCase()}</span></div>
        ${this.paymentMethod === 'cash' ? `
          <div class="row"><span>Dibayar</span><span>Rp ${this.formatPrice(this.cashPaid)}</span></div>
          <div class="row bold"><span>Kembali</span><span>Rp ${this.formatPrice(this.change)}</span></div>` : ''}
        <div class="divider"></div>
        <div class="center small">Terima Kasih 🙏 <br/> Barang yang sudah dibeli <br/> tidak dapat dikembalikan</div>
      </body>
    </html>`);
    win!.print();
  }

  resetAfterTransaction() {
    this.cart = [];
    this.customerName = '';
    this.memberPhone = '';
    this.memberData = null;
    this.cashPaid = 0;
    this.cashPaidDisplay = '';
    this.change = 0;
    this.paymentMethod = 'cash';
    this.showPaymentModal = false;
    this.loadKasir();
  }
}
