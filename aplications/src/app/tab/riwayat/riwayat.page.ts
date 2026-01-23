import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CapacitorHttp } from '@capacitor/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController }from '@ionic/angular';
import * as ExcelJS from 'exceljs';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { saveAs } from 'file-saver';
import { AlertController, ModalController } from '@ionic/angular';
import { BarcodeTextPlacement, BarcodeTextPlacements, CapacitorThermalPrinter, DataCodeType, DataCodeTypes } from 'capacitor-thermal-printer';
import { StorageService } from '../../storage.service';
import { ChangeDetectorRef } from '@angular/core';
import { SuccessAnimationComponentPage } from '../../success-animation-component/success-animation-component.page';
import { FailAnimationComponentPage } from '../../fail-animation-component/fail-animation-component.page';


import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8';

  @Component({
  selector: 'app-riwayat',
  templateUrl: './riwayat.page.html',
  styleUrls: ['./riwayat.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  providers: [File, FileOpener]
})
export class RiwayatPage {
  riwayatList: any[]                = [];
  filteredRiwayatList: any[]        = [];
  isLoading: boolean                = false;
  errorMessage: string              = '';
  id_outlet: string                 = '';
  selectedDate: string              = '';
  isDateSelected: boolean           = false;
  isDownloadButtonVisible: boolean  = true;
  selectedRiwayatId: number | null = null;
  inputPaymentAmount: number = 0;
  isPaymentModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  selectedSegment: string = 'lunas';


  paymentMethod: string   = '';
  paymentOptions: { code: string, name: string }[] = [];
  customer_name: string   = '';
  customer_phone: string  = '';
  outlet_code: string     = '';
  outlet_name: string     = '';
  userName: string        = '';
  address: string         = '';
  phoneNumber: string     = '';
  ppn: number = 0;
  profileImage: string = '';

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private file: File,
    private fileOpener: FileOpener,
    private storageService: StorageService,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {

    this.outlet_code  = this.storageService.getOutletCode();
    this.outlet_name  = this.storageService.getOutletName();
    this.userName     = this.storageService.getUsrNm();
    this.address      = this.storageService.getAddress();
    this.phoneNumber  = this.storageService.getPhoneNumber();

    // this.getPaymentMethod();
    this.loadUserData();
    this.fetchRiwayat();
    this.filterRiwayat();
  }

  paymentMethodMapping: { [key: string]: string } = {
    'CA': 'Cash',
    'TF': 'Transfer',
    'DC': 'Debit Card',
    'QR': 'Qris',
    'Kredit': 'Kredit'
  };



  ionViewWillEnter() {
    this.loadUserData();
    this.fetchRiwayat();
    this.filterRiwayat(); // Pastikan filter diterapkan setiap kali halaman dibuka

    if (localStorage.getItem('refresh_riwayat') === 'true') {
      this.fetchRiwayat();
      localStorage.removeItem('refresh_riwayat');
    }
  }

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


  loadUserData() {
    const storedUserData = localStorage.getItem('user_data');

    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      this.id_outlet = userData.userData.id_outlet;
    } else {
      this.presentAlert('Error', 'No user data found in localStorage');
    }
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('id-ID'); // Format mata uang Indonesia
  }

    async fetchRiwayat() {
      this.isLoading = true;
      this.errorMessage = '';

      try {
          const response = await CapacitorHttp.get({
              url: `https://epos.pringapus.com/api/v1/Riwayat/getRiwayat/${this.id_outlet}`,
              headers: {
                  'Content-Type': 'application/json',
              },
          });

          console.log('Response dari API:', response.data);

          if (response.data && response.data.status) {
              this.riwayatList = response.data.data.map((item: any) => {
                  console.log('Item sebelum mapping:', item);

                  return {
                      id: item.id,
                      created_date: item.created_datetime.split(' ')[0],
                      created_time: item.created_datetime.split(' ')[1],
                      customer_name: item.customer_name || 'Tidak diketahui',
                      customer_phone: item.customer_phone || '-',
                      customer_address: item.customer_address || 'Tidak ada alamat',
                      customer_shipping_cost: parseFloat(item.ongkir) || 0,
                      customer_payment_method: item.customer_payment_method,
                      customer_payment_total: parseFloat(item.customer_payment_total) || 0,
                      customer_discount: parseFloat(item.diskon) || 0,
                      customer_ppn: parseFloat(item.ppn) || 0,
                      status_pembayaran: item.status_pembayaran,
                      kurang_bayar: parseFloat(item.kurang_bayar) || 0,
                      total_bayar: parseFloat(item.total_bayar) || 0,
                      dibayar: parseFloat(item.dibayar) || 0,
                      kembalian: parseFloat(item.kembalian) || 0,
                      items_detail: (Array.isArray(item.items_detail) && item.items_detail.length > 0)
                          ? item.items_detail.flat().map((detail: any) => {
                              console.log('Detail item:', detail);

                              return {
                                  id_product: detail.id_product || null,
                                  product_name: detail.name || detail.product_name || 'Tidak diketahui',
                                  price: parseFloat(detail.price) || 0,
                                  qty: parseInt(detail.qty, 10) || 0,
                                  discount: parseFloat(detail.discount) || 0,
                                  img_url: detail.img_url || 'assets/images/no-image.png',
                                  addons: (Array.isArray(detail.addon) && detail.addon.length > 0)
                                      ? detail.addon.map((addon: any) => {
                                          return {
                                              addon_name: addon.name || 'Tidak diketahui',
                                              addon_price: parseFloat(addon.price) || 0,
                                          };
                                      })
                                      : []
                              };
                          })
                          : []
                  };
              });

              console.log('Riwayat List setelah mapping:', this.riwayatList);
              this.filteredRiwayatList = [...this.riwayatList];
              this.filterRiwayat();
          } else {
              this.errorMessage = response.data.message || 'Data tidak ditemukan.';
              this.presentAlert('Error', this.errorMessage);
          }
      } catch (error) {
          this.errorMessage = 'Terjadi kesalahan saat memuat data.';
          console.error('Error fetching data:', error);
          this.presentAlert('Error', this.errorMessage);
      } finally {
          this.isLoading = false;
      }
  }

openEditModal(riwayatId: number) {
  this.selectedRiwayatId = riwayatId;
  this.inputPaymentAmount = 0;
  this.isEditModalOpen = true; // Pastikan modal yang dibuka adalah modal edit
}

closeEditModal() {
  this.isEditModalOpen = false; // Tutup modal edit
  this.selectedRiwayatId = null;
  this.inputPaymentAmount = 0;
}

async submitPayment() {
  if (!this.selectedRiwayatId || this.inputPaymentAmount <= 0) {
    this.presentAlert('Error', 'Masukkan jumlah pembayaran yang valid.');
    return;
  }

  try {
    const response = await CapacitorHttp.post({
      url: `https://epos.pringapus.com/api/v1/Riwayat/update_nominal`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        id: this.selectedRiwayatId,
        customer_payment_total: this.inputPaymentAmount
      }
    });

    if (response.data && response.data.status) {
      this.presentToast('Pembayaran berhasil diperbarui', 'success');
      this.fetchRiwayat(); // Refresh data setelah pembayaran
    } else {
      this.presentAlert('Error', response.data.message || 'Gagal memperbarui pembayaran.');
    }
  } catch (error) {
    this.presentAlert('Error', 'Terjadi kesalahan saat memperbarui pembayaran.');
    console.error('Error updating payment:', error);
  } finally {
    this.closePaymentModal();
  }
}

async presentToast(message: string, color: string = 'success') {
  const toast = await this.toastController.create({
    message: message,
    duration: 2000,
    position: 'bottom',
    color: color,
  });
  await toast.present();
}




  // async getPaymentMethod() {
  //   const user = JSON.parse(localStorage.getItem('user_data') || '{}');

  //   if (!user || !user.userData || !user.userData.outlet_code) {
  //     this.presentAlert('Error', 'ID Outlet tidak ditemukan!');
  //     return;
  //   }

  //   try {
  //     const response = await CapacitorHttp.get({
  //       url: `https://epos.pringapus.com/api/v1/cart/get_payment_method/${user.userData.outlet_code}`,
  //       headers: { 'Content-Type': 'application/json' },
  //     });

  //     const result = response.data;

  //     if (result.status) {
  //       const paymentCodes = result.data.payment_method.split(',');

  //       this.paymentOptions = paymentCodes.map((code: string) => ({
  //         code: code.trim(), // Kode metode pembayaran
  //         name: this.getPaymentName(code.trim()) // Nama metode pembayaran
  //       }));


  //       console.log('Metode pembayaran:', this.paymentOptions); // Debugging
  //     } else {
  //       this.presentAlert('Error', 'Harap tambahkan metode pembayaran terlebih dahulu!');
  //     }
  //   } catch (error) {
  //     console.error('Terjadi kesalahan:', error);
  //     this.presentAlert('Error', 'Gagal mengambil metode pembayaran!');
  //   }
  // }

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

async presentPrintOptions(riwayat: any) {

  return new Promise(async (resolve) => {
    const alert = await this.alertController.create({
      header: 'Pilih Metode Invoice',
      message: 'Silakan pilih metode pengiriman invoice:',
      buttons: [
        {
          text: 'WhatsApp',
          handler: async () => {
            await this.printSendWa(riwayat);
            await this.showSuccessAnimation();
            resolve(true);
          }
        },
        {
          text: 'Print',
          handler: async () => {
            await this.print(riwayat);
            await this.showSuccessAnimation();
            resolve(true);
          }
        }
      ]
    });

    await alert.present();
  });
}

generateTitleHeaderText(riwayat: any): string {
  let titleHeaderText = '';
  titleHeaderText += `${this.outlet_name}\n\n`;
  return titleHeaderText;
}

generateHeaderText(riwayat: any): string {
  let headerText = '';
  headerText += `${this.address}\n`;
  headerText += `${this.phoneNumber}\n`;
  headerText += '===========================\n\n';
  return headerText;
}

generateSubText(riwayat: any): string {
  let subText = '';
  const now = new Date();
  const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
  const formattedTime = `${now.getHours()}.${now.getMinutes().toString().padStart(2, '0')}`;
  subText += 'Struk Pembayaran\n';
  subText += `Waktu    : ${formattedDate} ${formattedTime}\n`;
  subText += `Kasir    : ${this.userName}\n`;
  subText += `Metode   : ${this.getPaymentName(riwayat.customer_payment_method)}\n\n`;
  subText += '----------------------------\n';
  return subText;
}

generateTitleMiddleText(riwayat: any): string {
  let titleMiddleText = '';
  titleMiddleText += 'Daftar Pembelian\n';
  return titleMiddleText;
}

generateContentMiddleText(riwayat: any): string {
  let contentMiddleText = '';
  contentMiddleText += '----------------------------\n';
  contentMiddleText += `Pelanggan : ${riwayat.customer_name ?? '-'}\n`;
  contentMiddleText += `No.HP     : ${this.formatPhoneNumber(riwayat.customer_phone ?? '-')}\n`;
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

  for (const item of riwayat.items_detail) {
    const itemName = item.product_name.padEnd(10);
    const qty = item.qty.toString().padStart(0);
    const price = formatK(item.price).padStart(0);
    const total = (item.qty * item.price).toString().padStart(0);
    const paperWidth = 28;
    const leftText = `${qty} x ${price}`;
    const rightText = `${formatK(Number(total))}`;

    contentMiddleText += `\n${itemName}\n`;
    contentMiddleText += leftText.padEnd(paperWidth - rightText.length, " ") + rightText + "\n";

    if (item.addons && item.addons.length > 0) {
      for (const addon of item.addons) {
        const addonName = addon.addon_name.padEnd(0);
        const addonQty = "1".padStart(0);
        const addonPrice = formatK(addon.addon_price).padStart(0);
        const addonTotal = (addon.addon_price).toString().padStart(0);

        contentMiddleText += ` +${addonName} (${formatK(Number(addonTotal))})\n`;
      }
    }
  }

  // contentMiddleText += '\n----------------------------\n';
  // contentMiddleText += `Diskon    : Rp${formatK(riwayat.customer_discount ?? 0)}\n`;
  // contentMiddleText += `PPN       : Rp${formatK(riwayat.customer_ppn ?? 0)}\n`;
  // contentMiddleText += `Total     : Rp${formatK(riwayat.total_bayar)}\n`;
  // contentMiddleText += `Dibayar   : Rp${formatK(riwayat.dibayar ?? 0)}\n`;

  // const changeAmount = (riwayat.dibayar ?? 0) - riwayat.total_bayar;
  // if (changeAmount > 0) {
  //   contentMiddleText += `Kembalian : Rp${formatK(changeAmount)}\n`;
  //   contentMiddleText += `Status    : Lunas\n`;
  // } else if (changeAmount < 0) {
  //   contentMiddleText += `Kekurangan: Rp${formatK(-changeAmount)}\n`;
  //   contentMiddleText += `Status    : Belum Lunas\n`;
  // } else {
  //   contentMiddleText += `Status    : Lunas\n`;
  // }

  // contentMiddleText += '----------------------------\n\n';




  // contentMiddleText += '\n----------------------------\n';
  // contentMiddleText += `Diskon    : Rp${formatK(riwayat.customer_discount ?? 0)}\n`;
  // contentMiddleText += `PPN       : Rp${formatK(riwayat.customer_ppn ?? 0)}\n`;
  // contentMiddleText += `Total     : Rp${formatK(riwayat.total_bayar)}\n`;
  // contentMiddleText += `Dibayar   : Rp${formatK(riwayat.dibayar ?? 0)}\n`;

  // const changeAmount = (riwayat.dibayar ?? 0) - riwayat.total_bayar;
  // if (changeAmount > 0) {
  //   contentMiddleText += `Kembalian : Rp${formatK(changeAmount)}\n`;
  //   contentMiddleText += `Status    : Lunas\n`;
  // } else if (changeAmount < 0) {
  //   contentMiddleText += `Kekurangan: Rp${formatK(-changeAmount)}\n`;
  //   contentMiddleText += `Status    : Belum Lunas\n`;
  // } else {
  //   contentMiddleText += `Status    : Lunas\n`;
  // }

  // contentMiddleText += '----------------------------\n\n';




  contentMiddleText += '\n----------------------------\n';

  const paperWidth = 28; // Lebar kertas

  const formatLine = (label: string, value: string) => {
    return label.padEnd(paperWidth - value.length, " ") + value + "\n";
  };

  contentMiddleText += formatLine('Diskon', `${formatK(riwayat.customer_discount ?? 0)}`);
  contentMiddleText += formatLine('PPN', `${formatK(riwayat.customer_ppn ?? 0)}`);
  contentMiddleText += formatLine('Total', `${formatK(riwayat.total_bayar)}`);
  contentMiddleText += formatLine('Dibayar', `${formatK(riwayat.dibayar ?? 0)}`);

  const changeAmount = (riwayat.dibayar ?? 0) - riwayat.total_bayar;
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





  return contentMiddleText;
}

generateFooterText(riwayat: any): string {
  let footerText = '';
  footerText += 'TERIMA KASIH TELAH BERBELANJA!\n';
  return footerText;
}

async print(riwayat: any) {
  const titleHeaderText = this.generateTitleHeaderText(riwayat);
  const headerText = this.generateHeaderText(riwayat);
  const subText = this.generateSubText(riwayat);
  const titleMiddleText = this.generateTitleMiddleText(riwayat);
  const contentMiddleText = this.generateContentMiddleText(riwayat);
  const footerText = this.generateFooterText(riwayat);
  // const img = this.getBase64Image('assets/lg.png');

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
    .image(await this.profileImage)
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
    .text(contentMiddleText)
    .align('center')
    .bold()
    .text(footerText)
    .cutPaper()
    .write()
    .then(() => this.successPrintError())
    .catch((e: Error) => this.catchPrintError(e));
}


printSendWa(riwayat: any) {
  console.log('Data riwayat:', riwayat); // Debugging awal

  const now = new Date();
  const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
  const formattedTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

  const formatRupiah = (num: number | undefined) =>
    `Rp${(num ?? 0).toLocaleString('id-ID')}`;

  const send = Array.isArray(riwayat?.items_detail) ? riwayat.items_detail.map((detail: {
    product_name: string;
    price: number;
    qty: number;
    discount: number;
    addons: any[]
  }) => ({
    name: detail.product_name ?? 'Tidak diketahui',
    price: detail.price ?? 0,
    qty: detail.qty ?? 1,
    subtotal: (detail.qty * detail.price) - (detail.discount ?? 0),
    addon: Array.isArray(detail.addons) ? detail.addons.map((addon: {
      addon_name: string,
      addon_price: number
    }) => ({
      name: addon.addon_name ?? 'Tanpa Nama',
      price: addon.addon_price ?? 0,
    })) : []
  })) : [];

  console.log('Customer Payment Detail:', send); // Debugging detail pesanan

  // ✅ Hitung total pembayaran
  const totalAmount = riwayat?.customer_payment_total ?? 0;
  const paidAmount = riwayat?.dibayar ?? 0;
  const changeAmount = Math.max(0, paidAmount - totalAmount);

  const Data = {
    outlet_name: this.outlet_name,
    address: this.address,
    phone: this.phoneNumber,
    formatDate: formattedDate,
    formatTime: formattedTime,
    kasir: this.userName,
    customer_name: riwayat?.customer_name ?? "Pelanggan",
    customer_phone: riwayat?.customer_phone ?? "-",
    customer_address: riwayat?.customer_address ?? "-",

    customer_payment_detail: send, // ✅ Pastikan ini array

    customer_payment_method: riwayat?.customer_payment_method ?? "Tidak diketahui",
    customer_payment_total: totalAmount,
    customer_ppn: riwayat?.customer_ppn ?? 0,
    customer_shipping_cost: riwayat?.customer_shipping_cost ?? 0,
    customer_paid_amount: paidAmount,
    customer_change_amount: changeAmount
  };

  console.log('Data yang dikirim:', Data); // Debugging sebelum dikirim ke API

  CapacitorHttp.post({
    url: `https://epos.pringapus.com/api/v1/Authentication/invoice_again`,
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify(Data) // ✅ Pastikan JSON dikirim dalam format yang valid
  }).then((response) => {
    console.log('Response dari server:', response);
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






openPaymentModal(id: number, kurangBayar: number) {
  this.selectedRiwayatId = id;
  this.inputPaymentAmount = kurangBayar; // Default diisi dengan sisa yang harus dibayar
  this.isPaymentModalOpen = true;
}
closePaymentModal() {
  this.isPaymentModalOpen = false;
}


async updatePayment() {
  if (!this.selectedRiwayatId || this.inputPaymentAmount <= 0) {
      this.presentAlert('Error', 'Masukkan jumlah pembayaran yang valid.');
      return;
  }

  try {
      // 1. Perbarui data pembayaran di server
      const response = await CapacitorHttp.post({
          url: 'https://epos.pringapus.com/api/v1/Riwayat/update_payment',
          headers: {
              'Content-Type': 'application/json',
          },
          data: {
              id: this.selectedRiwayatId,
              customer_payment_total: this.inputPaymentAmount,
          },
      });

      if (response.data && response.data.status) {
          // this.presentAlert('Success', 'Pembayaran berhasil diperbarui.');
          // 2. Muat ulang data riwayat dari server
          await this.fetchRiwayat();

          // 3. Cari riwayat yang telah diperbarui dari daftar yang baru dimuat
          const riwayatToPrint = this.riwayatList.find(riwayat => riwayat.id === this.selectedRiwayatId);

          if (riwayatToPrint) {
            // 4. Cetak struk dengan data riwayat terbaru
            this.presentPrintOptions(riwayatToPrint);
            this.fetchRiwayat();
            this.isPaymentModalOpen = false;
          } else {
              console.error('Riwayat tidak ditemukan setelah pembaruan.');
              this.presentAlert('Error', 'Riwayat tidak ditemukan setelah pembaruan.');
          }
      } else {
          this.presentAlert('Error', response.data.message || 'Gagal memperbarui pembayaran.');
      }
  } catch (error) {
      console.error('Error updating payment:', error);
      this.presentAlert('Error', 'Terjadi kesalahan saat memperbarui pembayaran.');
  }
}




  filterRiwayatByDate() {
    if (!this.selectedDate) {
      this.filteredRiwayatList = [...this.riwayatList];
      return;
    }

    const formattedDate = this.selectedDate.split('T')[0];
    this.filteredRiwayatList = this.riwayatList.filter(
      riwayat => riwayat.created_date === formattedDate
    );
  }



  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }



  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  searchQuery: string = '';
  searchRiwayat() {
    if (this.searchQuery.trim() === '') {
        this.filteredRiwayatList = [...this.riwayatList];
    } else {
        const query = this.searchQuery.toLowerCase();
        this.filteredRiwayatList = this.riwayatList.filter(item =>
            item.customer_name.toLowerCase().includes(query) ||
            item.customer_phone.toLowerCase().includes(query) ||
            item.customer_payment_method.toLowerCase().includes(query) ||
            item.customer_payment_total.toString().includes(query) ||
            item.created_date.toLowerCase().includes(query) ||
            item.items_detail.some((detail: {
                product_name: string;
                qty: number;
            }) =>
                detail.product_name.toLowerCase().includes(query) ||
                detail.qty.toString().includes(query)
            )
        );
    }
}


////JANGAN DI RUBAHH!!!!!///
  getPaymentMethod(method: string): string {
    const methods: { [key: string]: string } = {
      CA: 'Cash',
      VA: 'Virtual Account',
      TF: 'Transfer',
      DC: 'Debit/Credit Card',
      QR: 'Qris',
      Kredit: 'Kredit',
    };
    return methods[method] || 'Metode tidak dikenal';
  }




    async showExportAlert() {
      const alert = await this.alertController.create({
          header: 'Pilih Tindakan',
          message: 'Pilih apakah Anda ingin mengunduh semua data atau memilih tanggal',
          buttons: [
              {
                  text: 'Unduh Semua Data',
                  handler: () => {
                      this.filteredRiwayatList = [...this.riwayatList]; // Menggunakan semua data
                      this.generateExcel(); // Unduh semua data
                  },
              },
              {
                  text: 'Pilih Tanggal',
                  handler: () => {
                      this.isDateSelected = true; // Tampilkan modal pemilihan tanggal
                  },
              },
          ],
      });

      await alert.present();
  }

  closeDateModal() {
      this.isDateSelected = false; // Tutup modal
  }

  onDateSelected() {
    if (!this.selectedDate) return;

    const selectedDateFormatted = this.selectedDate.split('T')[0];
    console.log("Selected Date (formatted):", selectedDateFormatted);

    // Filter data berdasarkan tanggal yang dipilih
    this.filteredRiwayatList = this.riwayatList.filter((item) => {
        const itemDate = new Date(item.created_date);
        const itemDateString = itemDate.toISOString().split('T')[0];
        console.log("Comparing", itemDateString, "with", selectedDateFormatted);
        return itemDateString === selectedDateFormatted;
    });

    console.log("Filtered Data:", this.filteredRiwayatList);

    // Pastikan hanya menampilkan alert jika tidak ada data setelah filter
    if (this.filteredRiwayatList.length === 0) {
        alert('Tidak ada data untuk tanggal yang dipilih.');
        console.log("Data ditemukan:", this.filteredRiwayatList);
    } else {
        console.log("Data ditemukan:", this.filteredRiwayatList);
        this.generateExcel(this.selectedDate);  // Proses untuk generate Excel jika ada data
    }

    this.isDateSelected = false;  // Menyembunyikan indikator tanggal yang dipilih
 }


 generateExcel(selectedDate?: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Otatea');
  const now = new Date();
  const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
  const formattedTime = `${now.getHours()}.${now.getMinutes().toString().padStart(2, '0')}`;

  // Menambahkan baris judul
  const titleRow = worksheet.addRow(['Laporan Riwayat Order']);
  worksheet.mergeCells(`A1:H1`);
  titleRow.font = { bold: true, size: 16 };
  titleRow.alignment = { horizontal: 'center', vertical: 'middle' };

  // Menambahkan baris tanggal cetak
  const dateRow = worksheet.addRow([`Tanggal Cetak: ${formattedDate} ${formattedTime}`]);
  worksheet.mergeCells(`A2:H2`);
  dateRow.font = { size: 14 };
  dateRow.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.addRow([]); // Baris kosong untuk spasi

  // Menambahkan header tabel
  const headerRow = worksheet.addRow(['', 'Tanggal', 'Produk', 'Qty', 'Topping', 'Harga', 'Total Harga']);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 15 };
  headerRow.eachCell((cell, colNumber) => {
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    if (colNumber >= 2 && colNumber <= 7) {

      // Selang-seling warna berdasarkan nomor kolom
      const bgColor = colNumber % 2 === 0 ? 'FC9C4C' : '5f5f5f';

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgColor },
      };

      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
      };
    }
  });
  headerRow.height = 45;

  // Filter data berdasarkan tanggal yang dipilih
  let filteredRiwayat = selectedDate ? this.riwayatList.filter(detail => {
    const orderDate = new Date(detail.created_date);
    const orderDateString = `${orderDate.getFullYear()}-${(orderDate.getMonth() + 1).toString().padStart(2, '0')}-${orderDate.getDate().toString().padStart(2, '0')}`; // YYYY-MM-DD

    return orderDateString === selectedDate.split('T')[0]; // Mengabaikan waktu pada selectedDate
  }) : this.riwayatList; // Jika tidak ada tanggal, ambil semua data

  // Memberi peringatan jika tidak ada data untuk tanggal yang dipilih
  if (filteredRiwayat.length === 0) {
    alert('Tidak ada data untuk tanggal yang dipilih.');
    return;
  }

  // Menambahkan data ke dalam Excel
  filteredRiwayat.forEach((detail: any) => {
    detail.items_detail.forEach((item: any) => {
        const addonNames = item.addons.map((addon: any) => addon.addon_name).join(', ') || '-';

        const detailRow = worksheet.addRow([
            '',
            detail.created_date,
            item.product_name,
            item.qty + ' pcs',
            addonNames,
            'Rp.' + this.formatCurrency(item.price),
            'Rp.' + this.formatCurrency(detail.customer_payment_total),
        ]);

        // Menyusun perataan dan format sel
        detailRow.eachCell((cell, colNumber) => {
            if (colNumber >= 2 && colNumber <= 7) {
                const textLength = String(cell.value).length;
                const maxColumnWidth = (worksheet.columns[colNumber - 1]?.width || 10) * 1.5;

                cell.alignment = {
                    horizontal: textLength > maxColumnWidth ? 'left' : 'center',
                    vertical: 'middle',
                    wrapText: false, // Tidak turun ke baris baru
                };

                cell.font = { bold: true, color: { argb: '000000' } };
                cell.border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } },
                };
            }

            if (colNumber === 3) {
              cell.alignment = {
                 horizontal: 'left'
              }
            }

            if (colNumber === 5) {
              cell.alignment = {
                 horizontal: 'left'
              }
            }

            if (colNumber === 4) {
              cell.alignment = {
                 horizontal: 'right'
              }
            }

            if (colNumber === 6) {
              cell.alignment = {
                 horizontal: 'right'
              }
            }

            if (colNumber === 7) {
              cell.alignment = {
                 horizontal: 'right'
              }
            }

            // Selang-seling warna latar belakang
            if ([3, 5, 7].includes(colNumber)) {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'e6e8e8' },
                };
            }
        });
    });
});

// Mengatur lebar kolom supaya teks panjang tetap sesuai
worksheet.columns = [
    { width: 5 },  // Kosong
    { width: 25 }, // Tanggal
    { width: 25 }, // Nama Produk
    { width: 12 }, // Qty
    { width: 30 }, // Topping
    { width: 18 }, // Harga
    { width: 18 }, // Total Bayar
];

// Menambahkan border ke semua sel
const rowCount = worksheet.rowCount;
for (let i = 1; i <= rowCount; i++) {
    worksheet.getRow(i).eachCell((cell, colNumber) => {
        if (colNumber >= 2 && colNumber <= 7) {
            cell.border = {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } },
            };
        }
    });
};

  // Menulis dan mengunduh file Excel

  // workbook.xlsx.writeBuffer().then((data) => {
  //   const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //   saveAs(blob, 'Otatea.xlsx');
  // });



      workbook.xlsx.writeBuffer().then(async (data) => {
        const blob = new Blob([data], { type: EXCEL_TYPE });
        const now = new Date();
        const formattedDate = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
        const formattedTime = `${now.getHours()}.${now.getMinutes().toString().padStart(2, '0')}`;
        const fileName = `Otatea ${formattedDate}, ${formattedTime}.xlsx`;
        const base64 = await this.blobToBase64(blob);
        await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: Directory.Documents,
          recursive: true,
        });
        this.presentAlert('Success', 'Excel telah tersimpan di File Documents anda');
      });
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

    private blobToBase64(blob: Blob): Promise<string> {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
    });





  }

  setDefaultImage(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/image-not-found.png';
  }



filterRiwayat() {
  if (this.selectedSegment === 'belum_lunas') {
    this.filteredRiwayatList = this.riwayatList.filter(r => r.status_pembayaran !== 'Lunas');
  } else if (this.selectedSegment === 'lunas') {
    this.filteredRiwayatList = this.riwayatList.filter(r => r.status_pembayaran === 'Lunas');
  }
  this.hitungBelumLunas(); // Panggil fungsi di sini
}

belum_lunas: number = 0;


hitungBelumLunas() {
  this.belum_lunas = this.riwayatList.filter(r => r.status_pembayaran !== 'Lunas').length;
}
// this.riwayatList.filter(r => r.status_pembayaran !== 'Lunas')



validateNumber(event: KeyboardEvent) {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode < 48 || charCode > 57) {
    event.preventDefault(); // Mencegah karakter selain angka
  }
}


}


