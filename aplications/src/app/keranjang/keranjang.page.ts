import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { CapacitorHttp } from '@capacitor/core';
import { AlertController, ModalController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
  import { BarcodeTextPlacement, BarcodeTextPlacements, CapacitorThermalPrinter, DataCodeType, DataCodeTypes } from 'capacitor-thermal-printer';
import { StorageService } from '../storage.service';
import { ChangeDetectorRef } from '@angular/core';
import { SuccessAnimationComponentPage } from '../success-animation-component/success-animation-component.page';
import { FailAnimationComponentPage } from '../fail-animation-component/fail-animation-component.page';
import { Subscription } from 'rxjs';
import { QrisModalPage } from '../qris-modal/qris-modal.page';
Object.assign(window, { CapacitorThermalPrinter });
interface Topping {
     id: string;
  name: string;
  price: number;
  selected?: boolean;
}

@Component({
  selector: 'app-keranjang',
  templateUrl: './keranjang.page.html',
  styleUrls: ['./keranjang.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
})
export class KeranjangPage implements OnInit {
  private subscription: Subscription | null = null;
  cartItems: any[] = [];
  selectedItems: any[] = [];
  selectAllChecked: boolean = false;
  paymentMethod: string   = '';
  paymentOptions: { code: string, name: string }[] = [];
  deliveryOption: string  = 'delivery';
  discount: number        = 0;
  ongkir: number        = 0;
  gst: number             = 0;
  customer_name: string = '-';
  customer_phone: string = '0';
  outlet_code: string     = '';
  outlet_name: string     = '';
  userName: string        = '';
  address: string         = '';
  phoneNumber: string     = '';
  ppn: number = 0;
  availableToppings: any[] = [];
  selectedToppings: any[] = [];
  customerPaidAmount: number | null = null;
  totalAmount: number = 0; // Total yang harus dibayar
  remainingAmount: number = 0; // Sisa pembayaran
  ppnEnabled: boolean = false;
  profileImage: string = '';
  customer_address :string = '-';
  isOngkirEnabled: boolean = false;
  redeemMethod: string = '';
  redeemCode: string = '';
  redeemData: any = null;
  redeemItems: any[] = [];
  ticketNumber: string = '';

  totalPointNeeded: number = 0;
  userPoint: number = 0;
  customerPoint: number | null = null; // nilai poin customer dari redeem_code
  remainingPoint: number | null = null;
  lastCheckedCode: string | null = null;


  constructor(
    public router: Router,
    private cartService: CartService,
    private storageService: StorageService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef
  ) { }

  private isAnimationPlaying = false;

  private async successPrintError() {
    const toast = await this.toastController.create({
      message: 'Print invoice berhasil!',
      duration: 1500,
      position: 'bottom',
      color: 'success',
    });

    await toast.present();
  }

  private async catchPrintError(error: Error) {
    const toast = await this.toastController.create({
      message: 'Print gagal, printer belum terkoneksi! ',
      duration: 1500,
      position: 'bottom',
      color: 'danger',
    });

    await toast.present();
    this.showFailAnimation();
  }

  // async getBase64Image(url: string): Promise<string> {
  //   const response = await fetch(url);
  //   const blob = await response.blob();
  //   return new Promise((resolve) => {
  //       const reader = new FileReader();
  //       reader.onloadend = () => resolve(reader.result as string);
  //       reader.readAsDataURL(blob);
  //   });
  // }

  ngOnInit() {
    this.cartItems = this.cartService.getCartItems();
    this.outlet_code  = this.storageService.getOutletCode();
    this.outlet_name  = this.storageService.getOutletName();
    this.userName     = this.storageService.getUsrNm();
    this.address      = this.storageService.getAddress();
    this.phoneNumber  = this.storageService.getPhoneNumber();
    this.getPPN();
    this.ongkir = 0;
    const storedOngkirStatus = localStorage.getItem('isOngkirEnabled');
    if (storedOngkirStatus) {
      this.isOngkirEnabled = JSON.parse(storedOngkirStatus);
    }
    this.updateTotalAmount();
    this.updateTotalAmount();
    this.getPaymentMethod();
    this.availableToppings = this.cartService.getAvailableToppings();
    this.loadPPNStatus();
    this.getPPN();

    console.log('ini this.cartItems:', this.cartItems);
    if (this.cartItems && this.cartItems.length > 0) {
      this.cartItems.forEach(item => {
        this.resetToppingSelection(item);
      });
    }

   this.subscription = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.updateTotalAmount();
      this.cdr.detectChanges();
    });
    this.getItems();
  }
  checkOngkirStatus() {
    const storedOngkirStatus = localStorage.getItem('isOngkirEnabled');
    console.log('Stored Ongkir Status from localStorage:', storedOngkirStatus);

    this.isOngkirEnabled = storedOngkirStatus ? JSON.parse(storedOngkirStatus) : false;

    console.log('Parsed isOngkirEnabled:', this.isOngkirEnabled);
  }
  resetToppingSelection(item: any) {
    if (item.selectedToppings && item.selectedToppings.length > 0) {
      item.selectedToppings.forEach((topping: any) => {
        topping.selected = false;
      });
    }

    if (item.availableToppings && item.availableToppings.length > 0) {
      item.availableToppings.forEach((topping: any) => {
        topping.selected = false;
      });
    }
  }
  paymentMethodMapping: { [key: string]: string } = {
    'CA': 'Cash',
    'TF': 'Transfer',
    'DC': 'Debit Card',
    'QR': 'Qris',
    'Kredit': 'Kredit'
  };

  displayToppings(item: any) {
    if (item.selectedToppings && item.selectedToppings.length > 0) {
      return item.selectedToppings.map((topping: any) => `${topping.name} - Rp. ${topping.price}`).join(', ');
    } else {
      return 'No Toppings'; // Jika tidak ada topping yang dipilih
    }
  }


  updateTotalAmount() {
    this.totalAmount = this.calculateTotal(); // Ambil total dari fungsi yang sudah benar
    console.log("Total Amount (setelah hitung):", this.totalAmount); // Debugging
    this.calculateRemainingAmount(); // Pastikan sisa pembayaran dihitung juga
  }

  async onPaymentMethodChange(event: any) {
      this.paymentMethod = event.detail.value;
      this.customerPaidAmount = 0; // Default ke 0 untuk semua metode pembayaran
      this.calculateRemainingAmount();

      // if (this.paymentMethod === 'QR') {
      //   await this.openQrisModal();
      // }
  }

//   async openQrisModal() {
//     const cleanedName = 'Adil';
//     const cleanedPhone = '085745122054';
//     const email       = 'priaidaman6678@gmail.com';
//   const modal = await this.modalController.create({
//     component: QrisModalPage,
//     componentProps: {
//       amount: this.calculateTotal(),
//       customer_name: cleanedName,
//       customer_email: email,
//       customer_phone: cleanedPhone
//     }
//   });

//   await modal.present();
//   const { data } = await modal.onWillDismiss();
//   if (data?.status === 'paid') {
//     console.log('QRIS sudah dibayar');
//   }
// }


remainingLabel: string = 'Kekurangan Bayar'; // Label awal

onPaidAmountChange(event: any) {
    let value = event.target.value;
    value = value.replace(/[^0-9.]/g, '');
    this.customerPaidAmount = value ? parseFloat(value) : 0;
    this.calculateRemainingAmount();
}

calculateRemainingAmount() {
    const total = this.calculateTotal();
    const paid = this.customerPaidAmount ?? 0;

    this.remainingAmount = total - paid;
    if (paid > total) {
        this.remainingLabel = 'Kembalian';
        this.remainingAmount = paid - total; // Ubah perhitungan untuk kembalian
    } else {
        this.remainingLabel = 'Kekurangan Bayar';
        this.remainingAmount = total - paid;
    }
}


  async getPaymentMethod() {
    const user = JSON.parse(localStorage.getItem('user_data') || '{}');

    if (!user || !user.userData || !user.userData.outlet_code) {
      this.presentAlert('Error', 'ID Outlet tidak ditemukan!');
      return;
    }

    try {
      const response = await CapacitorHttp.get({
        url: `https://epos.pringapus.com/api/v1/cart/get_payment_method/${user.userData.outlet_code}`,
        headers: { 'Content-Type': 'application/json' },
      });

      const result = response.data;

      if (result.status) {
        const paymentCodes = result.data.payment_method.split(',');

        this.paymentOptions = paymentCodes.map((code: string) => ({
          code: code.trim(),
          name: this.getPaymentName(code.trim())
        }));


        console.log('Metode pembayaran:', this.paymentOptions); // Debugging
      } else {
        this.presentAlert('Error', 'Harap tambahkan metode pembayaran terlebih dahulu!');
      }
    } catch (error) {
      console.error('Terjadi kesalahan:', error);
      this.presentAlert('Error', 'Gagal mengambil metode pembayaran!');
    }
  }

  getPaymentName(code: string): string {
    const paymentNames: { [key: string]: string } = {
      'CA': 'Cash',
      'TF': 'Transfer',
      'DC': 'Debit',
      'QR': 'Qris',
      'Kredit': 'Kredit',

    };
    return paymentNames[code] || 'Metode Tidak Dikenal';
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  toggleSelection(item: any, event: any, isTopping: boolean = false) {
    if (isTopping) {
      // Logika pilih topping
      const index = this.selectedToppings.findIndex((t) => t.id === item.id);
      if (event.target.checked && index === -1) {
        this.selectedToppings.push(item);
      } else if (!event.target.checked && index !== -1) {
        this.selectedToppings.splice(index, 1 );
      }
    } else {

      if (event.target.checked) {
        const index = this.selectedItems.findIndex((i) => i.id === item.id);
        if (index === -1) {
          const itemCopy = JSON.parse(JSON.stringify(item));
          this.resetToppingSelection(itemCopy);
          this.selectedItems.push(itemCopy);
        }
      } else {
        this.selectedItems = this.selectedItems.filter((i) => i.id !== item.id);
      }
    }
    this.updateSelectAllStatus();
    this.calculateSubtotal();
  }

  toggleSelectAll(event: any) {
    this.selectAllChecked = event.target.checked;

    if (this.selectAllChecked) {
      this.selectedItems = [...this.cartItems]; // Pilih semua item
    } else {
      this.selectedItems = []; // Hapus semua item dari pilihan
    }
  }

  updateSelectAllStatus() {
    this.selectAllChecked = this.cartItems.length > 0 && this.selectedItems.length === this.cartItems.length;
  }
  loadPPNStatus() {
    const storedPPN = localStorage.getItem('isPPNEnabled');
    this.ppnEnabled = storedPPN ? JSON.parse(storedPPN) : false;
    console.log('✅ PPN status updated:', this.ppnEnabled);

    // 🔥 Paksa Angular untuk update tampilan
    this.cdr.detectChanges();
  }

  // Modifikasi calculateSubtotal untuk menghitung harga topping yang dipilih
  calculateSubtotal(): number {
    if (!this.selectedItems || this.selectedItems.length === 0) {
      return 0;
    }

    let subtotal = 0;

    // Hitung subtotal untuk setiap item
    this.selectedItems.forEach(item => {
      // Harga dasar item
      let itemTotal = parseFloat(item.price) * item.qty;

      // Tambahkan harga topping yang dipilih
      if (item.selectedToppings && item.selectedToppings.length > 0) {
        item.selectedToppings.forEach((topping: any) => {
          if (topping.selected === true) {
            itemTotal += parseFloat(topping.price) * item.qty;
          }
        });
      }

      subtotal += itemTotal;
    });

    return subtotal;
  }

  calculateDiscount(): number {
    return this.selectedItems.reduce((total, item) => {
      if (item.discount && item.discount > 0) {
        return total + item.discount; // diskon cuma sekali per item, gak dikali qty
      }
      return total;
    }, 0);
  }


calculatePPN(): number {
  if (!this.ppnEnabled) {
      return 0; // Jika PPN nonaktif, langsung return 0
  }

  const subtotal = this.calculateSubtotal();
  const discount = this.calculateDiscount();
  const ppn = (subtotal - discount) * (this.ppn / 100); // PPN dihitung setelah diskon
  return Math.round(ppn); // Pembulatan PPN
}
calculateTotal(): number {
  const subtotal = this.calculateSubtotal();
  const discount = this.calculateDiscount();
  const ppn = this.calculatePPN();
  const shippingFee = this.deliveryOption === 'delivery' ? Number(this.ongkir) || 0 : 0; // Pastikan ongkir angka

  const total = (subtotal - discount) + ppn + shippingFee;
  return Math.round(total);
}
onOngkirChange(event: any) {
  let raw = event.detail.value;

  // Filter hanya angka dari input
  let rawValue = raw.replace(/\D/g, ''); // Hapus semua karakter non-digit

  // Kalau kosong setelah difilter, set ongkir = 0
  if (!rawValue) {
    this.ongkir = 0;
    event.target.value = '';
    return;
  }

  // Format angka ke format rupiah (titik ribuan)
  let formatted = new Intl.NumberFormat('id-ID').format(Number(rawValue));

  this.ongkir = Number(rawValue);
  event.target.value = formatted;
}

onDeliveryOptionChange(event: any) {
  this.deliveryOption = event.detail.value;
  if (this.deliveryOption === 'takeaway') {
    this.ongkir = 0; // Reset ongkir jika Takeaway dipilih
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
      headers: { 'Content-Type': 'application/json' },
    });

    let data = response.data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch (e) { /* ignore */ }
    }

    console.log('Response API:', data);

    if (data && data.status) {
      const produk = data.data || [];
      (this as any).products = produk;
      this.cdr.detectChanges();
    } else {
      console.error('Data produk tidak ditemukan:', data?.message);
      this.presentAlert('Info', data?.message || 'Produk kosong');
    }
  } catch (error) {
    console.error('Terjadi kesalahan saat mengambil produk:', error);
    this.presentAlert('Error', 'Gagal mengambil produk.');
  }
}

calculateTotalPoint(): number {
    return (this.selectedItems || []).reduce((sum: number, item: any) => {
      const p = Number(item.point_sale ?? 0);
      return sum + (isFinite(p) ? p : 0);
    }, 0);
  }

  calculateRedeemPoint(): number {
    return (this.selectedItems || []).reduce((sum: number, r: any) => {
      const qty = Number(r.qty ?? 0);
      const cost = Number(r.cost ?? 0);
      return sum + (qty * cost);
    }, 0);
  }

  updateRemainingPoint() {
    const pointSaleTotal = this.selectedItems
      .map(item => Number(item.point_sale) || 0)
      .reduce((sum, v) => sum + v, 0);

    const customerPoint = Number(this.customerPoint ?? 0);
    this.remainingPoint = Math.abs(customerPoint - pointSaleTotal);
  }


  onRedeemKeyup(event: KeyboardEvent) {
    const value = (event.target as HTMLInputElement).value?.trim() ?? '';
    this.redeemCode = value;

    if (value.length === 0) {
      this.redeemData = null;
      this.customerPoint = null;
      this.remainingPoint = null;
      this.cdr.detectChanges();
      return;
    }

    CapacitorHttp.post({
      url: 'https://epos.pringapus.com/api/v1/cart/checkRedeem',
      headers: { 'Content-Type': 'application/json' },
      data: { code: value }
    }).then(res => {
      let body: any = res.data;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = { status: false }; }
      }

      if (body && body.status) {
        this.redeemData = body.data;
        this.customerPoint = Number(body.data.points ?? 0);
        this.updateRemainingPoint();
      } else {
        this.redeemData = null;
        this.customerPoint = 0;
        this.remainingPoint = null;
      }
      this.cdr.detectChanges();
    }).catch(err => {
      console.error('Error cek redeem:', err);
      this.redeemData = null;
      this.customerPoint = 0;
      this.remainingPoint = null;
      this.cdr.detectChanges();
    });
  }

  async pay() {
    if (this.selectedItems.length === 0) {
      this.presentAlert('Perhatian', 'Pilih setidaknya satu item sebelum melakukan pembayaran!');
      return;
      
    }
    const user = JSON.parse(localStorage.getItem('user_data') || '{}');
    if (!this.paymentMethod) {
      this.presentAlert('Perhatian', 'Pilih metode pembayaran sebelum melanjutkan!');
      return;
    }

    const cleanedName = (this.customer_name || '').trim();
    const cleanedPhone = (this.customer_phone || '').trim();
    const cleanedAddress = (this.customer_address || '').trim() || '-';
    if (!user || cleanedName === '' || cleanedPhone === '') {
      this.presentAlert('Perhatian', 'Silakan isi nama dan nomor telepon pelanggan!');
      return;
    }

    const totalHarga = this.calculateTotal();
    const shippingCost = this.deliveryOption === 'delivery' ? (Number(this.ongkir) || 0) : 0;
    const isCredit = (this.paymentMethod || '').toLowerCase() === 'kredit';
    const paidAmount = isCredit ? (Number(this.customerPaidAmount) || 0) : (Number(this.customerPaidAmount) || totalHarga);
    if (paidAmount < totalHarga) {
      this.presentAlert('Perhatian', 'Jumlah bayar kurang!');
      return;
    }

    const earnedPoints = this.calculateTotalPoint();
    const redeemPoints = this.calculateRedeemPoint();
    const itemsPayload = this.selectedItems.map(item => ({
      id_item: item.id ?? item.id_item ?? 0,
      name: item.name,
      price: item.price,
      qty: item.qty,
      discount: item.discount || 0,
      point: item.point ?? item.point_sale ?? 0
    }));

    const orderData: any = {
      id_outlet: user.userData.id_outlet,
      customer_name: cleanedName,
      customer_phone: cleanedPhone,
      customer_address: cleanedAddress,
      ongkir: shippingCost,
      customer_payment_total: totalHarga,
      customer_paid_amount: paidAmount,
      customer_change_amount: paidAmount - totalHarga,
      customer_payment_method: this.paymentMethod,
      diskon: 0,
      ppn: 0,
      customer_payment_detail: itemsPayload,
      // tambahan untuk backend:
      redeem_items: this.redeemItems,      // jika ada
      redeem_points: redeemPoints,        // total poin yang dipakai untuk redeem
      redeem_code: this.redeemCode || '', // jika pakai redeem_code
      earned_points: earnedPoints         // total earned (per-product)
    };

    try {
      const response = await CapacitorHttp.post({
        url: 'https://epos.pringapus.com/api/v1/cart/checkout',
        data: orderData,
        headers: { 'Content-Type': 'application/json' }
      });

      let result: any = response.data;
      if (typeof result === 'string') {
        try { result = JSON.parse(result); } catch {}
      }

      if (!result || !result.status) {
        this.presentAlert('Gagal', result?.message || 'Pembayaran gagal');
        return;
      }
      const payload = result.data || {};
      const orderId = payload.order_id;
      this.selectedItems.forEach(item => this.cartService.removeItem(item));
      this.cartService.refreshFromStorage();
      await this.getItems();
      await this.presentPrintOptions(orderData);
      this.cartService.notifyCheckout();

      // reset form
      this.selectedItems = [];
      this.paymentMethod = '';
      this.customer_name = '-';
      this.customer_phone = '0';
      this.customer_address = '-';
      this.redeemCode = '';
      this.redeemData = null;
      this.customerPoint = null;
      this.redeemItems = [];
      this.selectAllChecked = false;
      this.cdr.detectChanges();

    } catch (error) {
      console.error('Kesalahan saat checkout:', error);
      this.presentAlert('Error', 'Terjadi kesalahan saat memproses pembayaran.');
    }
  }

// async pay() {
//   if (this.selectedItems.length === 0) {
//       this.presentAlert('Perhatian', 'Pilih setidaknya satu item sebelum melakukan pembayaran!');
//       return;
//   }

//   const user = JSON.parse(localStorage.getItem('user_data') || '{}');

//   if (!this.paymentMethod) {
//       this.presentAlert('Perhatian', 'Pilih metode pembayaran sebelum melanjutkan!');
//       return;
//   }

//   const cleanedName = this.customer_name.trim();
//   const cleanedPhone = this.customer_phone.trim();
//   const cleanedAddress = this.customer_address.trim() || '-';

//   if (!user || cleanedName === '' || cleanedPhone === '') {
//       this.presentAlert('Perhatian', 'Silakan isi nama dan nomor telepon pelanggan!');
//       return;
//   }

//   const totalDiskon = this.calculateDiscount();
//   const totalPPN = this.calculatePPN();
//   const totalHarga = this.calculateTotal();
//   const shippingCost = this.deliveryOption === 'delivery' ? this.ongkir : 0;

//   const isCredit = this.paymentMethod.toLowerCase() === 'kredit';
//   const paidAmount = isCredit ? (Number(this.customerPaidAmount) || 0) : Number(this.customerPaidAmount) || totalHarga;

//   const changeAmount = Math.max(0, paidAmount - totalHarga);

//   const orderData = {
//       id_outlet: user.userData.id_outlet,
//       customer_name: cleanedName,
//       customer_phone: cleanedPhone,
//       customer_address: cleanedAddress,
//       ongkir: shippingCost,
//       customer_payment_total: totalHarga,
//       customer_paid_amount: paidAmount,
//       customer_change_amount: changeAmount,
//       customer_payment_method: this.paymentMethod,
//       diskon: totalDiskon,
//       ppn: totalPPN,
//       customer_payment_detail: this.selectedItems.map(item => ({
//           name: item.name,
//           price: item.price,
//           qty: item.qty,
//           discount: item.discount || 0,
//           addon: item.selectedToppings
//           ?.filter((topping: any) => topping?.selected === true)
//           .map((topping: any) => ({
//               name: topping.name,
//               price: topping.price,
//           })) || []
//       })),
//   };

//   console.log('🟢 Data yang dikirim:', JSON.stringify(orderData, null, 2));

//   try {
//       const response = await CapacitorHttp.post({
//           url: 'https://epos.pringapus.com/api/v1/cart/checkout',
//           data: orderData,
//           headers: {
//               'Content-Type': 'application/json',
//           },
//       });

//       console.log('📦 Response mentah dari server:', response.data);

//       let result;
//       try {
//           // Coba parse hanya jika string, atau pakai langsung kalau sudah object
//           if (typeof response.data === 'string') {
//               // Coba log dulu baris pertama aja
//               console.log('🔍 Baris pertama:', response.data.split('\n')[0]);
//               result = JSON.parse(response.data);
//           } else {
//               result = response.data;
//           }
//       } catch (parseErr) {
//           console.error('❌ Gagal parsing response JSON:', parseErr, '\n➡️ Response:', response.data);
//           this.presentAlert('Error', 'Format response server tidak valid!');
//           return;
//       }


//       if (result.status) {
//   await this.presentPrintOptions(orderData);

//   // Hapus item di cart
//   this.selectedItems.forEach((item) => this.cartService.removeItem(item));
//   this.cartService.refreshFromStorage();
//   await this.getItems();

//   // Notify tab/home untuk refresh
//   this.cartService.notifyCheckout();

//   // Reset form
//   this.selectedItems = [];
//   this.paymentMethod = '';
//   this.customer_name = '-';
//   this.customer_phone = '0';
//   this.customer_address = '-';
//   this.selectAllChecked = false;
//   this.cartService.setRefreshRiwayat();
//   this.cdr.detectChanges();
// }
//   } catch (error: any) {
//       console.error('🛑 Terjadi kesalahan:', error);
//       this.presentAlert('Error', 'Terjadi kesalahan saat memproses pembayaran.\n' + (error?.message || ''));
//   }
// }


toggleToppingSelection(topping: any, event: any) {
  // Update status topping
  topping.selected = event.target.checked;

  // Update topping di selectedItems
  this.selectedItems.forEach(item => {
    if (item.selectedToppings) {
      const matchingTopping = item.selectedToppings.find((t: any) => t.id === topping.id);
      if (matchingTopping) {
        matchingTopping.selected = topping.selected;
      }
    }
  });

  // Hitung ulang subtotal
  this.calculateSubtotal();
}

  async getPPN() {
    try {
      const response = await CapacitorHttp.get({
        url: 'https://epos.pringapus.com/api/v1/cart/get_ppn',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data && response.data.status) {
        this.ppn = response.data.ppn * 100; // Dari 0.11 jadi 11
        console.log('PPN:', this.ppn);
      } else {
        console.error('Gagal mendapatkan PPN:', response.data);
      }
    } catch (error) {
      console.error('Error fetching PPN:', error);
    }
  }


  getItemCount(): number {
    return this.cartItems.reduce((total, item) => total + item.qty, 0);
  }

  increaseQty(item: any) {
    item.qty++;
  }

  decreaseQty(item: any) {
    if (item.qty > 1) item.qty--;
  }

  


  onCustomerNameChange(event: any) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      let newValue = inputElement.value.trim();

      // Jika '-' masih di awal, hapus saat pengguna mulai mengetik
      if (newValue.startsWith('-')) {
        newValue = newValue.slice(1);
      }

      this.customer_name = newValue.length > 0 ? newValue : '-';
    }
  }

  onCustomerPhoneChange(event: any) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      let phoneValue = inputElement.value.replace(/\D/g, ''); // Hapus semua selain angka

      // Pastikan diawali dengan "0"
      if (!phoneValue.startsWith('0')) {
        phoneValue = '0' + phoneValue;
      }

      // Batasi maksimal 16 angka
      if (phoneValue.length > 16) {
        phoneValue = phoneValue.slice(0, 16);
      }

      this.customer_phone = phoneValue;
      inputElement.value = phoneValue; // Perbarui nilai input
    }
  }

onCustomerAddressChange(event: any) {
  this.customer_address = event.detail.value;
}




  async presentPrintOptions(orderData: any) {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Pilih Metode Invoice',
        message: 'Silakan pilih metode pengiriman invoice:',
        buttons: [
          {
            text: 'WhatsApp',
            handler: async () => {
              await this.printSendWa(orderData);
              await this.showSuccessAnimation();
              resolve(true);
            }
          },
          {
            text: 'Print',
            handler: async () => {
              await this.print(orderData);
              await this.showSuccessAnimation();
              resolve(true);
            }
          }
        ]
      });

      await alert.present();
    });
  }

  generateTitleHeaderText(orderData: any): string {
    let titleHeaderText = '';

    titleHeaderText += `${this.outlet_name}\n\n`;

    return titleHeaderText;
  }

  generateHeaderText(orderData: any): string {
    let headerText = '';

    headerText += `${this.address}\n`;
    headerText += `${this.phoneNumber}\n`;
    headerText += '===========================\n\n';

    return headerText;
  }

  generateSubText(orderData: any): string {
    let subText         = '';
    const now           = new Date();
    const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    const formattedTime = `${now.getHours()}.${now.getMinutes().toString().padStart(2, '0')}`;
    subText += 'Struk Pembayaran\n';
    subText += `Waktu     : ${formattedDate} ${formattedTime}\n`;
    subText += `Kasir     : ${this.userName}\n`;
    subText += `Metode    : ${this.getPaymentName(orderData.customer_payment_method)}\n\n`;
    subText += '----------------------------\n';

    return subText;
  }

  generateTitleMiddleText(orderData: any): string {
    let titleMiddleText = '';

    titleMiddleText += 'Daftar Pembelian\n';

    return titleMiddleText;
  }



  generateContentMiddleText(orderData: any): string {
    let contentMiddleText = '';
    contentMiddleText += '----------------------------\n';
    contentMiddleText += `Pelanggan : ${orderData.customer_name ?? '-'}\n`;
    contentMiddleText += `No.HP     : ${this.formatPhoneNumber(orderData.customer_phone)}\n`;
    contentMiddleText += '----------------------------\n';



    const formatK = (num: number) => {
      if (num >= 1000) {
        const formattedNum = (num / 1000).toFixed(1);
        if (formattedNum.endsWith('.0')) {
          return `${parseInt(formattedNum)}k`;
        } else {
          return `${formattedNum.replace('.', ',')}k`;
        }
      } else {
        return num.toString();
      }
    };

    for (const item of orderData.customer_payment_detail) {



      const itemName    = item.name.padEnd(10);
      const qty         = item.qty.toString().padStart(0);
      const price       = formatK(item.price).padStart(0);
      const total       = (item.qty * item.price).toString().padStart(0);
      const paperWidth  = 28;
      const leftText    = `${qty} x ${price}`;
      const rightText   = `${formatK(Number(total))}`;

      contentMiddleText += `\n${itemName}\n`;
      contentMiddleText += leftText.padEnd(paperWidth - rightText.length, " ") + rightText + "\n";


      // contentMiddleText += `${qty} x ${price} = ${formatK(Number(total))}\n`;
      // contentMiddleText += `\n${itemName} ${qty} x${price} = ${formatK(Number(total))}\n`;

      if (item.addon && item.addon.length > 0) {
        for (const addon of item.addon) {
            const addonName = addon.name.padEnd(0);
            const addonQty = "1".padStart(0); // Biasanya addon qty = 1
            const addonPrice = formatK(addon.price).padStart(0);
            const addonTotal = (addon.price).toString().padStart(0);

            contentMiddleText += ` +${addonName} (${formatK(Number(addonTotal))})\n`;
            // contentMiddleText += `=> ${addonQty} x${addonPrice} = ${formatK(Number(addonTotal))}\n`;
            // contentMiddleText += ` *${addonName} ${addonQty} x${addonPrice} = ${formatK(Number(addonTotal))}\n`;
          }
        }

    }

      // const formatK = (num: number) => {
      //   if (num >= 1000) {
      //     const formattedNum = (num / 1000).toFixed(1);
      //     if (formattedNum.endsWith('.0')) {
      //       return `${parseInt(formattedNum)}k`;
      //     } else {
      //       return `${formattedNum.replace('.', ',')}k`;
      //     }
      //   } else {
        //     return num.toString();
        //   }
      // };
      contentMiddleText += '\n----------------------------\n';

      const paperWidth = 28; // Lebar kertas

      const formatLine = (label: string, value: string) => {
          return label.padEnd(paperWidth - value.length, " ") + value + "\n";
      };

      contentMiddleText += formatLine('Diskon', `${formatK(orderData.diskon ?? 0)}`);
      contentMiddleText += formatLine('PPN', `${formatK(orderData.ppn ?? 0)}`);
      contentMiddleText += formatLine('Total', `${formatK(orderData.customer_payment_total)}`);
      contentMiddleText += formatLine('Dibayar', `${formatK(orderData.customer_paid_amount ?? 0)}`);

      const changeAmount = (orderData.customer_paid_amount ?? 0) - orderData.customer_payment_total;
      if (changeAmount > 0) {
          contentMiddleText += formatLine('Kembalian', `${formatK(changeAmount)}`);
          contentMiddleText += formatLine('Status', 'Lunas');
      } else if (changeAmount < 0) {
          contentMiddleText += formatLine('Kekurangan', `${formatK(-changeAmount)}`);
          contentMiddleText += formatLine('Status', 'Belum Lunas');
      } else {
          contentMiddleText += formatLine('Status', 'Lunas');
      }

      contentMiddleText += '----------------------------\n\n';

        // return contentMiddleText;



    // contentMiddleText   += '\n----------------------------\n';
    // contentMiddleText   += `Total: Rp ${formatK(orderData.customer_payment_total)}\n`;
    // contentMiddleText   += '----------------------------\n\n';

    return contentMiddleText;
  }

  generateFooterText(orderData: any): string {
    let footerText = '';

    footerText += 'TERIMA KASIH TELAH BERBELANJA!\n';

    return footerText;
  }

  async print(orderData: any) {
    const titleHeaderText       = this.generateTitleHeaderText(orderData);
    const headerText            = this.generateHeaderText(orderData);
    const subText               = this.generateSubText(orderData);
    const titleMiddleText       = this.generateTitleMiddleText(orderData);
    const contenttitleMiddleText= this.generateContentMiddleText(orderData);
    const footerText            = this.generateFooterText(orderData);
    // const img                   = this.getBase64Image('assets/natan.jpg')
    // const img                   = this.getBase64Image('assets/uwong.png')
    // const img                   = this.getBase64Image('assets/lg.png')
     // 🔥 Ambil gambar profil user
     await this.getLogoToko();

     console.log('🖼 Base64 Gambar untuk cetak:', this.profileImage);

     if (!this.profileImage.startsWith('data:image')) {
         console.error('❌ Gambar tidak valid! Menggunakan default.');
         this.profileImage = 'assets/lg.png';
     } else {
       // 🔥 Konversi ke hitam-putih agar lebih kompatibel dengan printer thermal
         this.profileImage = await this.convertToMonochrome(this.profileImage);
     }



    await CapacitorThermalPrinter.begin()
      .align('center')
      .image(this.profileImage)

      .doubleWidth()
      .doubleWidth()
      .text(titleHeaderText)
      .clearFormatting()

      .align('center')
      .bold()
      .text(headerText)


      .align('left')
      .text(subText)

      .align('center')
      .bold()
      .text(titleMiddleText)

      .align('left')
      .text(contenttitleMiddleText)

      .align('center')
      .bold()
      .text(footerText)

      .cutPaper()
      .write()
      .then(() => this.successPrintError())
      .catch((e: Error) => this.catchPrintError(e));
  }

  printSendWa(orderData: any) {
    const now = new Date();
    const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    const formattedTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

    const formatK = (num: number | undefined) =>
        (typeof num === 'number' && num >= 1000 ? (num / 1000).toFixed(1) + 'K' : (num ?? 0).toString());

    const send = orderData.customer_payment_detail.map((item: { name: string; price: number; qty: number; addon: any[] }) => {
        return {
            name: item.name,
            price: formatK(item.price),
            qty: item.qty,
            total: formatK(item.qty * item.price),
            addon: item.addon && item.addon.length > 0
                ? item.addon.map((topping: { name: string, price: number }) => ({
                    name: topping.name,
                    price: formatK(topping.price)
                }))
                : []
        };
    });

    // ✅ Hitung total harga termasuk ongkir
    const totalAmount = (orderData.customer_payment_total ?? 0) + (orderData.ongkir ?? 0);
    const paidAmount = orderData.customer_paid_amount ?? 0;
    const changeAmount = Math.max(0, paidAmount - totalAmount);

    const Data = {
        outlet_name: this.outlet_name,
        address: this.address,
        phone: this.phoneNumber,
        formatDate: formattedDate,
        formatTime: formattedTime,
        kasir: this.userName,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_address: orderData.customer_address ?? "-",
        customer_payment_total: formatK(totalAmount),
        customer_discount: formatK(orderData.diskon ?? 0),
        customer_ppn: formatK(orderData.ppn ?? 0),
        customer_shipping_cost: formatK(orderData.ongkir ?? 0),
        customer_payment_method: this.paymentMethodMapping[orderData.customer_payment_method] || orderData.customer_payment_method,
        customer_paid_amount: formatK(paidAmount),
        customer_change_amount: formatK(changeAmount),
        customer_payment_detail: send
    };

    CapacitorHttp.post({
        url: `https://epos.pringapus.com/api/v1/Authentication/invoice`,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(Data)
    }).then(() => {
        console.log('Invoice berhasil dikirim ke WhatsApp');
    }).catch((error) => {
        console.error('Error mengirim invoice:', error);
        alert('Gagal mengirim invoice ke WhatsApp.');
    });
}






    formatPhoneNumber(phoneNumber: string | null | undefined): string {
      if (!phoneNumber) {
          return '-';
      }

      const firstFourDigits = phoneNumber.substring(0, 4);
      const remainingDigits = phoneNumber.substring(4).replace(/./g, '*');
      return firstFourDigits + remainingDigits;
    }







    async getBase64Image(url: string): Promise<string> {
      try {
          console.log('📥 Fetching image via proxy:', url);
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
          const response = await fetch(proxyUrl);

          if (!response.ok) {
              console.error('❌ Gagal mengambil gambar:', response.statusText);
              return await this.convertImageAssetToBase64('assets/lg.png'); // Pakai default
          }

          const contentType = response.headers.get("content-type") || "";
          if (!contentType.startsWith("image")) {
              console.error("❌ Respons bukan gambar! Pakai default.");
              return await this.convertImageAssetToBase64('assets/lg.png');
          }

          const blob = await response.blob();
          return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  if (typeof reader.result === 'string' && reader.result.startsWith('data:image')) {
                      console.log('✅ Base64 sukses dibuat:', reader.result.substring(0, 50) + '...');
                      resolve(reader.result);
                  } else {
                      console.error('❌ Base64 tidak valid, pakai default.');
                      resolve(this.convertImageAssetToBase64('assets/lg.png'));
                  }
              };
              reader.readAsDataURL(blob);
          });

      } catch (error) {
          console.error('❌ Gagal mengonversi gambar ke base64:', error);
          return await this.convertImageAssetToBase64('assets/lg.png');
      }
  }

  async convertToMonochrome(base64: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
            console.log('Konversi ke Monochrome dimulai...');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                console.error("❌ Gagal mendapatkan context 2D!");
                reject(new Error("Canvas context is null"));
                return;
            }

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Floyd-Steinberg Dithering
            for (let i = 0; i < data.length; i += 4) {
                let oldPixel = data[i];
                let newPixel = oldPixel > 128 ? 255 : 0;
                let quantError = oldPixel - newPixel;

                data[i] = data[i + 1] = data[i + 2] = newPixel;

                if (i + 4 < data.length) data[i + 4] += quantError * 7 / 16;
                if (i + canvas.width * 4 - 4 < data.length) data[i + canvas.width * 4 - 4] += quantError * 3 / 16;
                if (i + canvas.width * 4 < data.length) data[i + canvas.width * 4] += quantError * 5 / 16;
                if (i + canvas.width * 4 + 4 < data.length) data[i + canvas.width * 4 + 4] += quantError * 1 / 16;
            }

            ctx.putImageData(imageData, 0, 0);
            const finalImage = canvas.toDataURL('image/png');
            console.log('Monochrome Base64:', finalImage.substring(0, 50) + '...');
            resolve(finalImage);
        };
        img.onerror = (e) => {
            console.error('Gagal memuat gambar untuk Monochrome:', e);
            reject(e);
        };
    });
  }

  async getLogoToko(): Promise<void> {
    try {
        const storedUserData = localStorage.getItem('user_data');
        if (!storedUserData) {
            console.error('User tidak ditemukan di localStorage');
            this.profileImage = await this.convertImageAssetToBase64('assets/lg.png');
            return;
        }

        const userData = JSON.parse(storedUserData);
        const idOutlet = userData?.userData?.id_outlet;

        if (!idOutlet) {
            console.error('ID User tidak ditemukan!');
            this.profileImage = await this.convertImageAssetToBase64('assets/lg.png');
            return;
        }

        const response = await CapacitorHttp.get({
            url: `https://epos.pringapus.com/api/v1/authentication/user_image?id_outlet=${idOutlet}&t=${Date.now()}`,
            headers: { 'Content-Type': 'application/json' }
        });

        console.log("🔍 Response dari API:", response.data);
        if (!response || !response.data) throw new Error('Gagal mengambil data dari API');

        const imageUrl = response.data.file_url || response.data;
        if (!imageUrl || imageUrl.includes("Gambar tidak ditemukan")) {
            console.error("Gambar tidak ditemukan di API, pakai default.");
            this.profileImage = await this.convertImageAssetToBase64('assets/lg.png');
            return;
        }

        console.log('Gambar URL:', imageUrl);
        this.profileImage = await this.getBase64Image(imageUrl);
        if (!this.profileImage.startsWith('data:image')) {
            console.error('Base64 gambar tidak valid! Pakai default.');
            this.profileImage = await this.convertImageAssetToBase64('assets/lg.png');
        }

    } catch (error) {
        console.error(' Gagal mengambil gambar profil:', error);
        this.profileImage = await this.convertImageAssetToBase64('assets/lg.png');
    }
  }

 async convertImageAssetToBase64(assetPath: string): Promise<string> {
    try {
        const response = await fetch(assetPath);
        const blob = await response.blob();

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });

    } catch (error) {
        console.error('❌ Gagal mengubah gambar default ke Base64:', error);
        return '';
    }
}













  async showSuccessAnimation() {
    if (this.isAnimationPlaying) return;
    this.isAnimationPlaying = true;

    const modal = await this.modalController.create({
      component: SuccessAnimationComponentPage,
      backdropDismiss: false
    });

    await modal.present();

    setTimeout(() => {
      modal.dismiss();
      this.isAnimationPlaying = false;
    }, 3000);
  }

  async showFailAnimation() {
    if (this.isAnimationPlaying) return;
    this.isAnimationPlaying = true;

    const modal = await this.modalController.create({
      component: FailAnimationComponentPage,
      backdropDismiss: false
    });

    await modal.present();

    setTimeout(() => {
      modal.dismiss();
      this.isAnimationPlaying = false;
    }, 3000);
  }

  removeItem(item: any) {
    this.cartService.removeItem(item);
    this.cartItems = this.cartService.getCartItems();
    this.selectedItems = this.selectedItems.filter((i) => i !== item);
    this.updateSelectAllStatus();
  }

  // onPaymentMethodChange(event: any) {
  //   console.log('Metode pembayaran dipilih:', this.paymentMethod);
  // }

  setDefaultImage(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/image-not-found.png';
  }

  validateNumber(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault(); // Mencegah karakter selain angka
    }
  }


  formatCurrency(value: number): string {
    return value.toLocaleString('id-ID'); // Format mata uang Indonesia
  }


}
