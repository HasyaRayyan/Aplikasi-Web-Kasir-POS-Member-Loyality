import { Component, NgZone, OnInit, ChangeDetectorRef } from '@angular/core';
import { CapacitorHttp } from '@capacitor/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { StorageService } from 'src/app/storage.service';
import { ActionSheetController, Platform, ToastController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActivatedRoute } from '@angular/router';
import { saveAs } from 'file-saver';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8';

  import { BarcodeTextPlacement, BarcodeTextPlacements, CapacitorThermalPrinter, DataCodeType, DataCodeTypes } from 'capacitor-thermal-printer';
  Object.assign(window, { CapacitorThermalPrinter });
  import { Filesystem, Directory } from '@capacitor/filesystem';
  import * as ExcelJS from 'exceljs';
import { SecureStorageService } from 'src/app/services/secure-storage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  userData: any = null;
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  isEditing: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  profileImage: string = 'assets/default-profile.png';
  paymentMethods: { code: string; name: string; isDisabled: boolean }[] = [
    { code: 'CA', name: 'Cash', isDisabled: false },
    { code: 'TF', name: 'Transfer', isDisabled: false },
    { code: 'DC', name: 'Debit Card', isDisabled: false },
    { code: 'QR', name: 'Qris', isDisabled: false },
    { code: 'Kredit', name: 'Kredit', isDisabled: false }
  ];
  isToppingEnabled: boolean = true ;
  isDiscountEnabled: boolean = false;
  isOngkirEnabled: boolean = false;
  managementStock: boolean = false;
  isfinance: boolean = false;
  isDateSelected = false;
  selectedDate: string = '';
  disableSelection: boolean = false;
  ppnEnabled: boolean = false;
  userSign = this.storageService
  user_level: string = '';
  selectedExportType: 'masuk' | 'keluar' = 'masuk';
  selectedMethods: string[] = [];

  selectedFinanceType: 'pemasukan' | 'pengeluaran' = 'pemasukan'; // atau 'pengeluaran' kalau mau
  selectedFinanceDate: string = '';
  selectedCategoryIds: string[] = [];

isDateFinanceSelected = false;

  devices: any  = [];
  isScanning    = false;
  isConnected   = false;
  id_user: string = '';
  moveItems: any[] = [];
  stockMasuk: any[] = [];
  stockKeluar: any[] = [];
  selectedSegment: string = 'masuk';
  isProfileModalOpen: boolean = false;
  selectedFinanceSegment: string = 'masuk';
  pemasukanData: any[] = [];
  pengeluaranData: any[] = [];
  isAddPengeluaranModal: boolean = false;
  categories: any[] = [];
  columns: any[][] = []; // array of columns (each column is array of categories)
  selectedCategoryId: string | null = null;
  newPengeluaran = {
    jumlah: 0,
    deskripsi: '',
    tanggal: ''
  };

  constructor(public router: Router, private secureStorage: SecureStorageService, private alertController: AlertController, private storageService: StorageService,zone: NgZone, private toastController: ToastController, private actionSheetCtrl: ActionSheetController,private toastCtrl: ToastController, private platform: Platform,   private cdr: ChangeDetectorRef,private route: ActivatedRoute ) {
    CapacitorThermalPrinter.addListener('discoverDevices', async ({ devices }) => {
      zone.run(() => {
        this.devices = devices;
      });
    });
    CapacitorThermalPrinter.addListener('connected', async () => {
      zone.run(() => {
        this.isConnected = true;
      });
      const toast = await this.toastController.create({
        message: 'Printer terkoneksi!',
        duration: 1500,
        position: 'bottom',
        color: 'success',
      });

      await toast.present();
    });
    CapacitorThermalPrinter.addListener('disconnected', async () => {
      zone.run(() => {
        this.isConnected = false;
      });
      const toast = await this.toastController.create({
        message: 'Koneksi printer terputus!',
        duration: 1500,
        position: 'bottom',
        color: 'warning',
      });

      await toast.present();
    });
    CapacitorThermalPrinter.addListener('discoveryFinish', () => {
      zone.run(() => {
        this.isScanning = false;
      });
    });
  }
  toggleToppingSelection() {
    this.isToppingEnabled = !this.isToppingEnabled;

    localStorage.setItem('isToppingEnabled', JSON.stringify(this.isToppingEnabled));

    // console.log('Topping status updated:', this.isToppingEnabled);
  }

  ngOnInit() {
    this.loadPPNStatus();
    this.route.queryParams.subscribe(params => {
      if (params['updated']) {
        // console.log('🔥 Membership diperbarui, reload data...');
        this.loadUserData();
      }
    });
    this.selectedDate = new Date().toISOString();
    this.checkOngkirStatus();
    this.getProfileImage();
    this.loadDiscountStatus();
    this.loadUserData();
    this.checkIfAlreadySelected();
    this.fetchPaymentMethods();
    this.user_level = this.storageService.getUserLevel();
    this.checkToppingStatus();
    console.log('liat',this.profileImage);
    this.loadCategories();
  }

  async logout() {
  try {
    await this.secureStorage.remove('persistentToken');
    await this.secureStorage.remove('outlet_code');
    await this.secureStorage.remove('username');
  } catch (e) {
    console.warn('secureStorage cleanup failed', e);
  }

  // hapus localStorage keys yang terkait
  localStorage.removeItem('user_data');
  localStorage.removeItem('access_token');
  localStorage.removeItem('device_token');

  // navigasi
  await this.router.navigate(['/login']);
}


  loadUserData() {
  const raw = localStorage.getItem('user_data');
  if (!raw) {
    console.log('❌ No user data found in localStorage');
    this.userData = null;
    this.username = '';
    this.user_level = '';
    this.id_user = '';
    return;
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse user_data:', e);
    this.userData = null;
    this.username = '';
    this.user_level = '';
    this.id_user = '';
    return;
  }

  /**
   * parsed could be:
   * 1) normalized: { userData: {...}, accessToken, ... }
   * 2) older flat: { id, username, member_level, ... }
   * 3) nested double: { userData: { userData: {...} } } <-- handle defensively
   */
  let u = parsed?.userData ?? parsed;

  // handle double nesting if exists
  if (u && u.userData) {
    u = u.userData;
  }

  // if still falsy, bail out
  if (!u) {
    console.warn('User object not found in user_data');
    this.userData = null;
    this.username = '';
    this.user_level = '';
    this.id_user = '';
    return;
  }

  // keep full parsed object for other fields (accessToken, persistentToken, etc.)
  this.userData = parsed;

  // safe extracts
  this.username = u?.username ?? u?.user_name ?? '';
  this.user_level = u?.member_level ?? u?.users_level ?? '';
  this.id_user = u?.id ?? u?.user_id ?? '';

  console.log('Loaded user:', { username: this.username, user_level: this.user_level, id: this.id_user });

  // If you rely on id to fetch profile image
  if (this.id_user) {
    this.getProfileImage();
  } else {
    console.log('ID user tidak ditemukan di userData!');
  }

  this.cdr.detectChanges();
}

  // logout() {
  //     localStorage.clear();

  //     this.ppnEnabled = false;
  //     this.isDiscountEnabled = true;
  //     this.isToppingEnabled = true;
  //     this.router.navigate(['/login']).then(() => {
  //         setTimeout(() => {
  //             this.loadPPNStatus();
  //             this.loadDiscountStatus();
  //             this.checkToppingStatus();

  //         }, 100);
  //     });
  // }

//   loadUserData() {
//     const storedUserData = localStorage.getItem('user_data');
//     if (storedUserData) {
//       this.userData = JSON.parse(storedUserData); // Parsing JSON
//       this.username = this.userData.userData.username;
//       this.user_level = this.userData.userData.member_level;

//       this.id_user = this.userData.userData.id || '';

//       console.log('ID User:', this.id_user);

//       if (this.id_user) {
//         this.getProfileImage();
//       } else {
//         console.log('ID user tidak ditemukan di userData!');
//       }

//       this.cdr.detectChanges();
//     } else {
//       console.log('❌ No user data found in localStorage');
//     }
// }

  loadDiscountStatus() {
    const storedDiscount = localStorage.getItem('isDiscountEnabled');
    this.isDiscountEnabled = storedDiscount ? JSON.parse(storedDiscount) : true;
}

async loadCategories() {
  try {
    const stored = localStorage.getItem('user_data');
    if (!stored) {
      console.error('User tidak ditemukan di localStorage');
      return;
    }
    const userData = JSON.parse(stored);
    const idOutlet = userData.userData.id_outlet;
    const response: any = await CapacitorHttp.post({
      url: 'https://epos.pringapus.com/api/v1/product_category/getCategory',
      headers: { 'Content-Type': 'application/json' },
      data: { id_outlet: idOutlet }
    });

    let categoriesFromServer: any[] = [];

    if (response && response.status === 200 && response.data && response.data.status) {
      categoriesFromServer = response.data.data || [];
    } else if (response && response.status === 200 && response.data && Array.isArray(response.data)) {
      categoriesFromServer = response.data;
    } else {
      console.warn('Response getCategory tidak sesuai, akan coba fallback ambil semua lalu filter di client.');
      const fallback: any = await CapacitorHttp.post({
        url: 'https://epos.pringapus.com/api/v1/product_category/getCategory',
        headers: { 'Content-Type': 'application/json' },
        data: {}
      });
      categoriesFromServer = (fallback && fallback.data && fallback.data.data) ? fallback.data.data : [];
    }
    this.categories = (categoriesFromServer || []).filter(cat => String(cat.id_outlet) === String(idOutlet));
    this.splitColumns();
    this.selectedCategoryIds = this.categories.filter(c => c.status === 'T').map(c => c.id);
    const saved = localStorage.getItem('selected_category');
    if (saved) {
      const exists = this.categories.find(c => String(c.id) === String(saved));
      if (exists) this.selectedCategoryId = saved;
      else this.selectedCategoryId = null;
    }
    
    this.cdr.detectChanges();
  } catch (err) {
    console.error('Error loadCategories:', err);
  }
}

onCategoryToggle(cat: any, event: any) {
  const isChecked = event.detail.checked;
  if (isChecked) {
    if (!this.selectedCategoryIds.includes(cat.id)) {
      this.selectedCategoryIds.push(cat.id);
      this.updateCategoryStatus(cat.id, 'T'); // aktifkan
    }
  } else {
    this.selectedCategoryIds = this.selectedCategoryIds.filter(id => id !== cat.id);
    this.updateCategoryStatus(cat.id, 'F'); // nonaktifkan
  }

  // Simpan ke localStorage kalau mau persist
  localStorage.setItem('selected_categories', JSON.stringify(this.selectedCategoryIds));

  console.log('Kategori aktif:', this.selectedCategoryIds);
}

async updateCategoryStatus(id: string, status: 'T' | 'F') {
  try {
    const body = `id=${encodeURIComponent(id)}&status=${encodeURIComponent(status)}`;
    const response: any = await CapacitorHttp.post({
      url: 'https://epos.pringapus.com/api/v1/product_category/updateCategoryStatus',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: body
    });

    const result = response.data;
    console.log('Update status kategori:', result);
    if (!result.status) {
      this.showToast(result.message || 'Gagal update status kategori');
    }
  } catch (err) {
    console.error('Error updateCategoryStatus:', err);
    this.showToast('Terjadi kesalahan saat update status');
  }
}

splitColumns() {
  const n = this.categories.length;
  if (n === 0) {
    this.columns = [[], []];
    return;
  }

  if (n >= 6) {
    const k = 3;
    // bagi seimbang
    const base = Math.floor(n / k);
    const rem = n % k; // sisanya disebar dari kiri ke kanan
    this.columns = [[], [], []];
    let idx = 0;
    for (let col = 0; col < k; col++) {
      const take = base + (col < rem ? 1 : 0);
      this.columns[col] = this.categories.slice(idx, idx + take);
      idx += take;
    }
  } else {
    // 2 kolom
    const leftCount = Math.ceil(n / 2);
    this.columns = [
      this.categories.slice(0, leftCount),
      this.categories.slice(leftCount)
    ];
  }
}

async promptAddCategory() {
  const alert = await this.alertController.create({
    header: 'Tambah Kategori',
    inputs: [
      {
        name: 'name',
        type: 'text',
        placeholder: 'Nama kategori'
      }
    ],
    buttons: [
      { text: 'Batal', role: 'cancel' },
      {
        text: 'Simpan',
        handler: async (data) => {
          const name = (data && data.name || '').trim();
          if (!name) {
            this.showToast('Nama kategori wajib diisi');
            return false;
          }
          await this.addCategory(name);
          return true;
        }
      }
    ]
  });

  await alert.present();
}

async addCategory(name: string) {
  try {
    const stored = localStorage.getItem('user_data');
    if (!stored) {
      this.showToast('User tidak ditemukan. Silakan login ulang.');
      return;
    }
    const userData = JSON.parse(stored);
    const idOutlet = userData.userData.id_outlet;
    const body = `id_outlet=${encodeURIComponent(idOutlet)}&name=${encodeURIComponent(name)}`;

    const response: any = await CapacitorHttp.post({
      url: 'https://epos.pringapus.com/api/v1/product_category/addProductCategoryList',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: body
    });

    const result = response.data;
    console.log('Response dari API:', result);

    if (result && result.status) {
      this.showToast('Kategori berhasil ditambahkan');
      await this.loadCategories();
    } else {
      this.showToast(result?.message || 'Gagal menambah kategori');
    }
  } catch (err) {
    console.error('Error addCategory:', err);
    this.showToast('Terjadi kesalahan saat menambah kategori');
  }
}

async promptDeleteCategory(cat: any) {
  const alert = await this.alertController.create({
    header: 'Hapus Kategori',
    message: `Yakin ingin menghapus kategori ${cat.name}? Semua referensi ke kategori ini mungkin terpengaruh.`,
    buttons: [
      { text: 'Batal', role: 'cancel' },
      {
        text: 'Hapus',
        handler: () => {
          // jangan remove UI di sini, tunggu respon server
          this.deleteCategory(cat);
        }
      }
    ]
  });
  await alert.present();
}

async deleteCategory(cat: any) {
  // optional: tampilkan loading
  let loadingToast: any = null;
  try {
    loadingToast = await this.toastController.create({
      message: 'Menghapus kategori...',
      duration: 0,
      position: 'bottom'
    });
    await loadingToast.present();
  } catch (e) {
    // ignore
  }

  try {
    const stored = localStorage.getItem('user_data');
    const userData = stored ? JSON.parse(stored) : null;
    const idOutlet = userData?.userData?.id_outlet ?? '';

    const body = `id=${encodeURIComponent(cat.id)}&id_outlet=${encodeURIComponent(idOutlet)}`;

    const response: any = await CapacitorHttp.post({
      url: 'https://epos.pringapus.com/api/v1/product_category/deleteProductCategory',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: body
    });

    // Hentikan loading
    if (loadingToast) { try { await loadingToast.dismiss(); } catch(_){} }

    // Banyak API mengemas hasil di response.data
    const res = response?.data ?? null;

    // Cek kode HTTP dulu (CapacitorHttp biasanya punya .status)
    const httpStatus = response?.status ?? 200;

    // Jika backend mengembalikan status boolean di res.status:
    if (res && typeof res.status !== 'undefined') {
      if (res.status === true) {
        // sukses -> update UI
        this.removeCategoryFromColumns(cat.id);
        await this.loadCategories();
        this.showToast('Kategori berhasil dihapus');
        return;
      } else {
        // gagal, ada pesan dari server
        const msg = res.message || 'Gagal menghapus kategori';
        // jika conflict (kategori masih dipakai) biasanya backend mengembalikan 409
        if (httpStatus === 409 || msg.toLowerCase().includes('digunakan')) {
          // beri pesan khusus
          await this.presentAlert('Gagal Hapus', msg);
        } else if (httpStatus === 403) {
          await this.presentAlert('Akses Ditolak', msg);
        } else {
          await this.presentAlert('Gagal', msg);
        }
        // refresh untuk menjaga konsistensi UI
        await this.loadCategories();
        return;
      }
    }

    // Fallback: jika backend tidak mengikuti struktur biasa, cek HTTP code
    if (httpStatus >= 200 && httpStatus < 300) {
      // asumsikan sukses
      this.removeCategoryFromColumns(cat.id);
      await this.loadCategories();
      this.showToast('Kategori berhasil dihapus');
      return;
    } else if (httpStatus === 409) {
      await this.presentAlert('Gagal Hapus', 'Kategori masih digunakan oleh produk. Hapus produk atau ubah kategori terlebih dahulu.');
      await this.loadCategories();
      return;
    } else if (httpStatus === 403) {
      await this.presentAlert('Akses Ditolak', 'Kategori tidak ditemukan atau bukan milik outlet ini.');
      await this.loadCategories();
      return;
    } else {
      await this.presentAlert('Gagal', `Server merespon dengan kode ${httpStatus}`);
      await this.loadCategories();
      return;
    }

  } catch (err: any) {
    // hentikan loading
    if (loadingToast) { try { await loadingToast.dismiss(); } catch(_){} }

    console.error('Error deleteCategory:', err);

    // network / timeout / unexpected error
    if (err?.message) {
      // jika error dari CapacitorHttp, kadang detail ada di err.message atau err.status
      await this.presentAlert('Kesalahan Jaringan', err.message || 'Terjadi kesalahan saat menghubungi server.');
    } else {
      await this.presentAlert('Kesalahan', 'Terjadi kesalahan saat menghapus kategori.');
    }

    // reload categories supaya UI konsisten
    await this.loadCategories();
  }
}

// --- perbaikan kecil: removeCategoryFromColumns tidak melakukan permanen sebelum server OK ---
removeCategoryFromColumns(catId: string) {
  for (let ci = 0; ci < this.columns.length; ci++) {
    const col = this.columns[ci];
    const index = col.findIndex((c: any) => String(c.id) === String(catId));
    if (index !== -1) {
      col.splice(index, 1);
      break;
    }
  }
  // jika mau, reflow:
  // this.splitColumns(); // atau reflow sesuai implementasimu
}

onCategoryChange(ev: any) {
  this.selectedCategoryId = ev.detail ? ev.detail.value : ev;
  localStorage.setItem('selected_category', String(this.selectedCategoryId));
  console.log('Kategori terpilih:', this.selectedCategoryId);
}

toggleDiscountStatus() {
    this.isDiscountEnabled = !this.isDiscountEnabled;
    localStorage.setItem('isDiscountEnabled', JSON.stringify(this.isDiscountEnabled));
    console.log('Diskon status updated:', this.isDiscountEnabled);
}

updateDiscountStatus(event: any) {
    this.isDiscountEnabled = event.detail.value === 'true';
    localStorage.setItem('isDiscountEnabled', JSON.stringify(this.isDiscountEnabled));
    console.log('Diskon status updated:', this.isDiscountEnabled);
}

  saveDiscountStatus() {
    localStorage.setItem('isDiscountEnabled', JSON.stringify(this.isDiscountEnabled));
    this.cdr.detectChanges();
  }


  loadPPNStatus() {
    const storedPPN = localStorage.getItem('isPPNEnabled');
    this.ppnEnabled = storedPPN ? JSON.parse(storedPPN) : false;
}

togglePPNStatus() {
    this.ppnEnabled = !this.ppnEnabled;
    localStorage.setItem('isPPNEnabled', JSON.stringify(this.ppnEnabled));
    console.log('PPN status updated:', this.ppnEnabled);
}

updatePPNStatus(event: any) {
    this.ppnEnabled = event.detail.value === 'true'; // Konversi ke boolean
    localStorage.setItem('isPPNEnabled', JSON.stringify(this.ppnEnabled));
    console.log('PPN status updated:', this.ppnEnabled);
}

toggleOngkirStatus() {
  localStorage.setItem('isOngkirEnabled', JSON.stringify(this.isOngkirEnabled));
  console.log('Ongkir status updated:', this.isOngkirEnabled);
}

checkOngkirStatus() {
  const storedOngkirStatus = localStorage.getItem('isOngkirEnabled');
  if (storedOngkirStatus) {
    this.isOngkirEnabled = JSON.parse(storedOngkirStatus);
  }
  console.log('Initial ongkir status from localStorage:', this.isOngkirEnabled);
}

  toggleToppingStatus() {
    localStorage.setItem('isToppingEnabled', JSON.stringify(this.isToppingEnabled));
    console.log('Topping status updated:', this.isToppingEnabled);
  }

  checkToppingStatus() {
    const storedToppingStatus = localStorage.getItem('isToppingEnabled');
    if (storedToppingStatus) {
      this.isToppingEnabled = JSON.parse(storedToppingStatus);
    }
    console.log('Initial topping status from localStorage:', this.isToppingEnabled);
  }

  async connectDevice(device: any) {
    await CapacitorThermalPrinter.connect({
      address: device.address,
    });
  }


  startScan() {
    if (this.isScanning) return;

    this.devices = [];
    CapacitorThermalPrinter.startScan().then(() => (this.isScanning = true));
  }

  stopScan() {
    CapacitorThermalPrinter.stopScan();
  }

  checkIfAlreadySelected() {
    if (this.userData && this.userData.userData.payment_method) {
      this.selectedMethods = this.userData.userData.payment_method.split(',');
      this.paymentMethods.forEach(method => {
        method.isDisabled = this.selectedMethods.includes(method.code);
        console.log(`Metode ${method.name} (${method.code}) disabled: ${method.isDisabled}`);
      });
    }
  }


  addEmployee() {
    if (!this.username || !this.password) {
      alert('Warning: Username dan password harus diisi.');
      return;
    }

    // Ambil data admin dari local storage
    let storedUserData = localStorage.getItem('user_data');
    let userData = storedUserData ? JSON.parse(storedUserData) : {};

    if (!userData?.userData?.id_outlet || !userData?.userData?.outlet_name) {
      alert('Error: Gagal mendapatkan data admin.');
      return;
    }

    const employeeData = {
      id_outlet: userData.userData.id_outlet,
      name: userData.userData.outlet_name,
      username: this.username,
      password: this.password
    };

    CapacitorHttp.post({
      url: 'https://epos.pringapus.com/api/v1/Outlets/add_employe',
      headers: { 'Content-Type': 'application/json' },
      data: employeeData,
    })
    .then((response: any) => {
      if (response.data && response.data.status) {
        alert('Success: Karyawan berhasil ditambahkan.');
        this.clearForm();
      } else {
        alert('Error: ' + (response.data.message || 'Gagal menambahkan karyawan.'));
      }
    })
    .catch((error) => {
      console.error('Error adding employee:', error);
      alert('Error: Terjadi kesalahan saat menambahkan karyawan.');
    });
  }

  // Fungsi untuk menghapus input setelah submit berhasil
  clearForm() {
    this.username = '';
    this.password = '';
  }





  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
  async fetchPaymentMethods() {
    const user = JSON.parse(localStorage.getItem('user_data') || '{}');
    if (!user || !user.userData || !user.userData.outlet_code) return;


    try {
        const response = await CapacitorHttp.get({
            url: `https://epos.pringapus.com/api/v1/cart/get_payment_method/${user.userData.outlet_code}`,
            headers: { 'Content-Type': 'application/json' },
        });

        console.log('Response API:', response);

        if (response.status === 200 && response.data.status) {
            const existingPayments = response.data.data.payment_method ? response.data.data.payment_method.split(',') : [];

            console.log('Metode pembayaran dari API:', existingPayments);
            this.selectedMethods = [...existingPayments];
            this.paymentMethods = this.paymentMethods.map(method => {
                return {
                    ...method,
                    isDisabled: existingPayments.includes(method.code),
                };
            });

            console.log('Daftar metode pembayaran setelah update:', this.paymentMethods);
            this.disableSelection = this.paymentMethods.every(m => m.isDisabled);
        } else {
            console.error('Gagal mengambil metode pembayaran:', response);
        }
    } catch (error) {
        console.error('Error saat mengambil metode pembayaran:', error);
    }
}
async savePaymentMethods() {
  if (!Array.isArray(this.selectedMethods)) {
      console.error('Error: selectedMethods bukan array!', this.selectedMethods);
      return;
  }

  const formattedMethods = this.selectedMethods.join(',');

  const data = {
      outlet_code: this.userData.userData.outlet_code,
      payment_method: formattedMethods,
  };

  try {
      const response = await CapacitorHttp.post({
          url: 'https://epos.pringapus.com/api/v1/Outlets/updatePaymentMethod',
          data: data,
          headers: { 'Content-Type': 'application/json' },
      });

      console.log('Response API:', response);

      if (response.status === 200) {
          console.log('Metode pembayaran berhasil diperbarui!');
          await this.fetchPaymentMethods();

          const alert = await this.alertController.create({
              header: 'Sukses',
              message: 'Metode pembayaran berhasil disimpan!',
              buttons: ['OK']
          });
          await alert.present();
      } else {
          console.error('Gagal memperbarui metode pembayaran:', response);
      }
  } catch (error) {
      console.error('Error saat menyimpan metode pembayaran:', error);
  }
}

  toggleMethod(code: string, isChecked: boolean) {
    if (isChecked) {
      if (!this.selectedMethods.includes(code)) {
        this.selectedMethods.push(code);
      }
    } else {
      this.selectedMethods = this.selectedMethods.filter(m => m !== code);
    }
    this.disableSelection = this.paymentMethods.every(m => m.isDisabled);
  }



  togglePaymentMethod(method: string) {
    if (this.selectedMethods.length >= this.paymentMethods.length && !this.selectedMethods.includes(method)) {
      console.log('Semua metode pembayaran sudah dipilih. Tidak bisa memilih lagi.');
      return;
    }

    if (this.selectedMethods.includes(method)) {
      this.selectedMethods = this.selectedMethods.filter(m => m !== method);
    } else {
      this.selectedMethods.push(method);
    }
  }

    

  profileEdit: boolean = false;
  addPay: boolean = false;
  option : boolean = false;
  addPrinter : boolean = false;

  openProfileEdit() {
    this.profileEdit = !this.profileEdit;
    this.addPay = false;
    this.option = false;
    this.addPrinter = false;
  }

  openAddPay() {
    this.addPay = !this.addPay;
    this.profileEdit = false;
    this.option = false;
    this.addPrinter = false;
  }

  openOption() {
    this.option = !this.option;
    this.profileEdit = false;
    this.addPay = false;
    this.addPrinter = false;
  }

  openAddPrinter() {
    this.addPrinter = !this.addPrinter;
    this.option = false;
    this.profileEdit = false;
    this.addPay = false;
  }

  async selectImage() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Pilih Gambar',
      buttons: [
        {
          text: 'Ambil Foto',
          icon: 'camera',
          handler: () => {
            this.pickImage(CameraSource.Camera);
          }
        },
        {
          text: 'Pilih dari Galeri',
          icon: 'images',
          handler: () => {
            this.pickImage(CameraSource.Photos);
          }
        },
        {
          text: 'Batal',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  async pickImage(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source
      });

      if (image.webPath) {
        this.profileImage = image.webPath; // Tampilkan gambar di UI
        this.uploadImage(image);
      }
    } catch (error) {
      console.error('Error memilih gambar:', error);
    }
  }

  async uploadImage(image: any) {
    try {
        const response = await fetch(image.webPath!);
        const blob = await response.blob();

        // 🔥 Kompres gambar sebelum upload
        const compressedBlob = await this.compressImage(blob, 0.4); // 0.4 = kualitas 40%

        const fileName = `profile_${Date.now()}.jpg`;

        // Ambil ID user dan id_outlet dari localStorage
        const storedUserData = localStorage.getItem('user_data');
        if (!storedUserData) {
          console.log('User tidak ditemukan, harap login ulang.');
            return;
        }
        const userData = JSON.parse(storedUserData);
        const idOutlet = userData.userData.id_outlet; // Ambil id_outlet

        const formData = new FormData();
        formData.append('file', compressedBlob, fileName);
        formData.append('id_outlet', idOutlet); // 🔥 Tambahkan id_outlet ke formData

        const uploadResponse = await fetch('https://epos.pringapus.com/api/v1/authentication/upload_image', {
            method: 'POST',
            body: formData
        });

        const result = await uploadResponse.json();
        if (result.status) {
            const updatedImageUrl = `${result.file_url}?t=${Date.now()}`; // Paksa refresh gambar baru
            this.profileImage = updatedImageUrl;
            localStorage.setItem('profile_image', updatedImageUrl); // Simpan di localStorage

            console.log('Gambar berhasil diunggah!');
            this.getProfileImage();
        } else {
            console.log('Gagal mengunggah gambar.');
        }
    } catch (error) {
        console.error('Error upload gambar:', error);
        console.log('Terjadi kesalahan saat upload.');
    }
  }

compressImage(blob: Blob, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');

              const maxWidth = 200; // 🔥 Resize gambar maksimal 300px (bisa diubah)
              const maxHeight = 200;
              let { width, height } = img;

              if (width > maxWidth || height > maxHeight) {
                  const scale = Math.min(maxWidth / width, maxHeight / height);
                  width *= scale;
                  height *= scale;
              }

              canvas.width = width;
              canvas.height = height;

              if (ctx) {
                  ctx.drawImage(img, 0, 0, width, height);
                  canvas.toBlob(
                      (compressedBlob) => {
                          if (compressedBlob) {
                              resolve(compressedBlob);
                          } else {
                              reject(new Error("Gagal mengompres gambar"));
                          }
                      },
                      "image/jpeg",
                      quality // 🔥 Kompres kualitas (0.6 = 60%)
                  );
              } else {
                  reject(new Error("Canvas tidak tersedia"));
              }
          };
      };
      reader.onerror = (error) => reject(error);
  });
}


  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
  async getProfileImage() {
    try {
        // Ambil ID user dan id_outlet dari localStorage
        const storedUserData = localStorage.getItem('user_data');
        if (!storedUserData) {
            console.error('User tidak ditemukan di localStorage');
            return;
        }
        const userData = JSON.parse(storedUserData);
        const idOutlet = userData.userData.id_outlet; // 🔥 Ambil id_outlet

        const response = await fetch(`https://epos.pringapus.com/api/v1/authentication/get_user_image?&id_outlet=${idOutlet}&t=${Date.now()}`);
        const result = await response.json();

        if (result.status && result.file_url) {
            const latestImageUrl = `${result.file_url}?t=${Date.now()}`;
            this.profileImage = latestImageUrl;
            localStorage.setItem('profile_image', latestImageUrl);
        }
    } catch (error) {
        console.error('Gagal mengambil gambar profil:', error);
    }
    console.log('Lihat profile image:', this.profileImage);
}


async deleteImage() {
  try {
      // 🔹 Ambil ID user dan id_outlet dari localStorage
      const storedUserData = localStorage.getItem('user_data');
      if (!storedUserData) {
        console.log('User tidak ditemukan, harap login ulang.');
          return;
      }

      const userData = JSON.parse(storedUserData);
      const idUser = userData.userData?.id;
      const idOutlet = userData.userData?.id_outlet; // 🔥 Ambil id_outlet

      if (!idUser || !idOutlet) {
        console.log('ID User atau ID Outlet tidak ditemukan!');
          return;
      }

      console.log('🔍 ID User:', idUser, 'ID Outlet:', idOutlet); // Debugging

      // 🔹 Kirim permintaan DELETE ke API
      const response = await fetch('https://epos.pringapus.com/api/v1/authentication/delete_image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_user: idUser, id_outlet: idOutlet }) // 🔥 Kirim id_outlet dalam body JSON
      });

      const result = await response.json();
      console.log('Response Hapus Gambar:', result); // Debugging response dari server

      if (result.status) {
          this.profileImage = 'assets/default-profile.png'; // Ganti ke gambar default
          localStorage.removeItem('profile_image'); // Hapus dari localStorage
          console.log('Gambar berhasil dihapus!');
      } else {
        console.log('Gagal menghapus gambar: ' + result.message);
      }
  } catch (error) {
      console.error('Error menghapus gambar:', error);
      console.log('Terjadi kesalahan saat menghapus.');
  }
}

async getMoveItems() {
  try {
    const storedUserData = localStorage.getItem('user_data');
    if (!storedUserData) {
      console.error('User tidak ditemukan di localStorage');
      return;
    }

    const userData = JSON.parse(storedUserData);
    const idOutlet = userData.userData.id_outlet;

    const response = await fetch(`https://epos.pringapus.com/api/v1/product_category/get_move_items?id_outlet=${idOutlet}&t=${Date.now()}`);
    const result = await response.json();

    if (result.status && Array.isArray(result.data)) {
      this.moveItems = result.data;

      this.stockMasuk = this.moveItems.filter(item => item.jenis === 'masuk');
      this.stockKeluar = this.moveItems.filter(item => item.jenis === 'keluar');
    }
  } catch (error) {
    console.error('Gagal mengambil data move items:', error);
  }
}
async showExportAlert(jenis: 'masuk' | 'keluar') {
  const alert = await this.alertController.create({
    header: 'Pilih Tindakan',
    message: 'Pilih apakah Anda ingin mengunduh semua data atau berdasarkan tanggal tertentu',
    buttons: [
      {
        text: 'Unduh Semua Data',
        handler: () => {
          this.generateMoveItemsExcel(jenis); // tanpa tanggal
        },
      },
      {
        text: 'Pilih Tanggal',
        handler: () => {
          this.selectedExportType = jenis;
          this.isDateSelected = true;
        },
      },
    ],
  });

  await alert.present();
}

closeDateModal() {
  this.isDateSelected = false;
}


onDateSelected() {
  if (!this.selectedDate) return;

  const formattedDate = this.selectedDate.split('T')[0];
  this.generateMoveItemsExcel(this.selectedExportType, formattedDate);
  this.isDateSelected = false;
}


async generateMoveItemsExcel(jenis: 'masuk' | 'keluar', selectedDate?: string) {
  try {
    const storedUserData = localStorage.getItem('user_data');
    if (!storedUserData) {
      console.error('User tidak ditemukan di localStorage');
      return;
    }

    const userData = JSON.parse(storedUserData);
    const idOutlet = userData.userData.id_outlet;

    const response = await fetch(`https://epos.pringapus.com/api/v1/product_category/get_move_items?id_outlet=${idOutlet}&t=${Date.now()}`);
    const result = await response.json();

    if (!(result.status && Array.isArray(result.data))) {
      alert('Gagal memuat data dari server');
      return;
    }

    const allItems: any[] = result.data;
    const filteredItems = allItems
      .filter((item: any) => item.jenis === jenis)
      .filter((item: any) => {
        if (!selectedDate) return true;

        const itemDate = new Date(item.created_at).toISOString().split('T')[0];
        const selected = selectedDate.split('T')[0];
        return itemDate === selected;
      });

    if (filteredItems.length === 0) {
      alert('Tidak ada data untuk jenis dan tanggal yang dipilih.');
      return;
    }

    // === Generate Excel ===
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Manajemen Stok');

    const now = new Date();
    const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    const formattedTime = `${now.getHours()}.${now.getMinutes().toString().padStart(2, '0')}`;

    const title = jenis === 'masuk' ? 'Laporan Stock Masuk' : 'Laporan Stock Keluar';

    const titleRow = worksheet.addRow([title]);
    worksheet.mergeCells(`A1:E1`);
    titleRow.font = { bold: true, size: 16 };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };

    const dateRow = worksheet.addRow([`Tanggal Cetak: ${formattedDate} ${formattedTime}`]);
    worksheet.mergeCells(`A2:E2`);
    dateRow.font = { size: 14 };
    dateRow.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.addRow([]);

    const header = worksheet.addRow(['No', 'Tanggal', 'Nama Produk', 'Qty', 'Jenis']);
    header.font = { bold: true, color: { argb: 'FFFFFF' }, size: 13 };
    header.eachCell((cell, i) => {
      const bgColor = i % 2 === 0 ? '5f5f5f' : 'FC9C4C';
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgColor },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    filteredItems.forEach((item: any, idx: number) => {
      const row = worksheet.addRow([
        idx + 1,
        item.created_at,
        item.name,
        item.qty,
        item.jenis
      ]);

      row.eachCell(cell => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    worksheet.columns = [
      { width: 5 },
      { width: 25 },
      { width: 30 },
      { width: 12 },
      { width: 15 }
    ];

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
  } catch (error) {
    console.error('Gagal generate Excel:', error);
    alert('Terjadi kesalahan saat mengunduh Excel');
  }
}

async blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve((reader.result as string).split(',')[1]);
    };
    reader.readAsDataURL(blob);
  });
}
async presentAlert(header: string, message: string) {
  const alert = await this.alertController.create({
    header,
    message,
    buttons: ['OK'],
  });
  await alert.present();
}

openProfileModal() {
  this.isProfileModalOpen = true;
}

closeProfileModal() {
  this.isProfileModalOpen = false;
}


setDefaultImage(event: Event) {
  (event.target as HTMLImageElement).src = 'assets/no-profile.png';
}
openStockModal() {
  this.managementStock = true; // Buka modal
  this.getMoveItems();        // Langsung ambil data stock
}
closeStockModal() {
  this.managementStock = false;
}
async fetchPemasukan() {
  const storedUserData = localStorage.getItem('user_data');
  if (!storedUserData) {
    console.error('User tidak ditemukan di localStorage');
    return;
  }

  const userData = JSON.parse(storedUserData);
  const idOutlet = userData.userData.id_outlet;

  try {
    const response = await CapacitorHttp.get({
      url: `https://epos.pringapus.com/api/v1/Finance/getCustomerPayment?id_outlet=${idOutlet}`,
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 200 && response.data.status) {
      this.pemasukanData = response.data.data.total_customer_payment.map((item: any) => ({
        customer_name: item.customer_name,
        customer_payment_total: item.customer_payment_total,
        product_names: item.product_names || [],
        addon_names: item.addon_names || [],
        tanggal: item.created_datetime.split(' ')[0],  // Format hanya tanggal (YYYY-MM-DD)
      }));
    }
  } catch (error) {
    console.error('Gagal ambil pemasukan:', error);
  }
}

async fetchPengeluaran() {
  const storedUserData = localStorage.getItem('user_data');
  if (!storedUserData) {
    console.error('User tidak ditemukan di localStorage');
    return;
  }

  const userData = JSON.parse(storedUserData);
  const idOutlet = userData.userData.id_outlet;

  try {
    const response = await CapacitorHttp.get({
      url: `https://epos.pringapus.com/api/v1/Finance/getTransaction?id_outlet=${idOutlet}`,
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 200 && response.data.status) {
      this.pengeluaranData = response.data.data.map((item: any) => ({
        deskripsi: item.deskripsi,
        jumlah: item.jumlah,
        tanggal: item.tanggal.split(' ')[0],  // Format hanya tanggal (YYYY-MM-DD)
      }));
    }
  } catch (error) {
    console.error('Gagal ambil pengeluaran:', error);
  }
}


openFinanceModal() {
  this.isfinance = true;
  this.fetchPemasukan();
  this.fetchPengeluaran();
}
closeFinanceModal() {
  this.isfinance = false;
}





    openAddPengeluaranModal() {
      this.isAddPengeluaranModal = true; // Menampilkan modal untuk menambah pengeluaran
    }

    // Fungsi untuk menutup modal tambah pengeluaran
    closeAddPengeluaranModal() {
      this.isAddPengeluaranModal = false;
    }

    async showExportAlertFinance(jenis: 'pemasukan' | 'pengeluaran') {
      const alert = await this.alertController.create({
        header: 'Pilih Tindakan',
        message: 'Pilih apakah Anda ingin mengunduh semua data atau berdasarkan tanggal tertentu',
        buttons: [
          {
            text: 'Unduh Semua Data',
            handler: () => {
              this.generateFinanceExcel(jenis); // tanpa tanggal
            },
          },
          {
            text: 'Pilih Tanggal',
            handler: () => {
              this.selectedFinanceType = jenis;
              this.isDateFinanceSelected = true;
            },
          },
        ],
      });

      await alert.present();
    }

    closeDateFinanceModal() {
      this.isDateFinanceSelected = false;
    }

    onDateFinanceSelected() {
      if (!this.selectedFinanceDate) return;

      const formattedDate = this.selectedFinanceDate.split('T')[0]; // Format jadi YYYY-MM-DD
      this.generateFinanceExcel(this.selectedFinanceType, formattedDate);
      this.isDateFinanceSelected = false;
    }
    async generateFinanceExcel(jenis: 'pemasukan' | 'pengeluaran', selectedDate?: string) {
      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Laporan Keuangan');

        const now = new Date();
        const formattedNow = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
        const formattedTime = `${now.getHours()}.${now.getMinutes().toString().padStart(2, '0')}`;
        const title = jenis === 'pemasukan' ? 'Laporan Pemasukan' : 'Laporan Pengeluaran';

        // Header & Tanggal Cetak
        const titleRow = worksheet.addRow([title]);
        worksheet.mergeCells('A1:E1');
        titleRow.font = { bold: true, size: 16 };
        titleRow.alignment = { horizontal: 'center', vertical: 'middle' };

        const dateRow = worksheet.addRow([`Tanggal Cetak: ${formattedNow} ${formattedTime}`]);
        worksheet.mergeCells('A2:E2');
        dateRow.font = { size: 14 };
        dateRow.alignment = { horizontal: 'center', vertical: 'middle' };

        worksheet.addRow([]); // Spacer

        let filtered: any[] = [];

        if (jenis === 'pemasukan') {
          worksheet.addRow(['No', 'Tanggal', 'Nama Customer', 'Produk / Addon', 'Jumlah Pembayaran']).eachCell((cell, i) => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 13 };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: i % 2 === 0 ? '5f5f5f' : 'FC9C4C' },
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });

          filtered = this.pemasukanData.filter((item: any) => {
            if (!selectedDate) return true; // Jika tidak pilih tanggal, tampilkan semua data
            return item.tanggal === selectedDate; // Filter berdasarkan tanggal yang dipilih (hanya bagian tanggal)
          });

          if (filtered.length === 0) {
            this.showNoDataAlert();
            return;
          }

          filtered.forEach((item: any, index: number) => {
            const produk = [...item.product_names, ...item.addon_names].join(', ') || '-';
            const row = worksheet.addRow([
              index + 1,
              item.tanggal,
              item.customer_name,
              produk,
              item.customer_payment_total
            ]);
            row.eachCell(cell => {
              cell.alignment = { horizontal: 'center', vertical: 'middle' };
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
            });
          });

          worksheet.columns = [
            { width: 5 },
            { width: 20 },
            { width: 25 },
            { width: 40 },
            { width: 20 },
          ];
        } else {
          worksheet.addRow(['No', 'Tanggal', 'Deskripsi', 'Jumlah']).eachCell((cell, i) => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 13 };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: i % 2 === 0 ? '5f5f5f' : 'FC9C4C' },
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });

          filtered = this.pengeluaranData.filter((item: any) => {
            if (!selectedDate) return true;
            return item.tanggal === selectedDate;
          });

          if (filtered.length === 0) {
            this.showNoDataAlert();
            return;
          }

          filtered.forEach((item: any, index: number) => {
            const row = worksheet.addRow([
              index + 1,
              item.tanggal,
              item.deskripsi,
              item.jumlah
            ]);
            row.eachCell(cell => {
              cell.alignment = { horizontal: 'center', vertical: 'middle' };
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
            });
          });

          worksheet.columns = [
            { width: 5 },
            { width: 20 },
            { width: 40 },
            { width: 20 },
          ];
        }

        // Simpan File
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
        // saveAs(blob, fileName);
      } catch (error) {
        console.error('Gagal generate Excel:', error);
        this.showErrorAlert('Terjadi kesalahan saat mengunduh Excel.');
      }
    }

    async showNoDataAlert() {
      const alert = await this.alertController.create({
        header: 'Tidak Ada Data',
        message: 'Tidak ada data untuk jenis dan tanggal yang dipilih.',
        buttons: ['OK'],
      });
      await alert.present();
    }

    async showErrorAlert(message: string) {
      const alert = await this.alertController.create({
        header: 'Gagal',
        message,
        buttons: ['OK'],
      });
      await alert.present();
    }


    // Fungsi untuk menambah pengeluaran
    async submitPengeluaran() {
      const { jumlah, deskripsi, tanggal } = this.newPengeluaran;

      if (!jumlah || !deskripsi || !tanggal) {
        alert('Semua field harus diisi');
        return;
      }

      try {
        const storedUserData = localStorage.getItem('user_data');
        if (!storedUserData) {
          console.error('User tidak ditemukan di localStorage');
          return;
        }

        const userData = JSON.parse(storedUserData);
        const idOutlet = userData.userData.id_outlet;

        const response = await CapacitorHttp.post({
          url: 'https://epos.pringapus.com/api/v1/Finance/addTransaction',
          headers: { 'Content-Type': 'application/json' },
          data: {
            id_outlet: idOutlet,
            jumlah: jumlah,
            deskripsi: deskripsi,
            tanggal: tanggal,
          },
        });

        if (response.status === 200 && response.data.status) {
          console.log('Pengeluaran berhasil ditambahkan');
          this.isAddPengeluaranModal = false; // Menutup modal
          this.fetchPengeluaran(); // Mengambil data pengeluaran terbaru
        } else {
          console.error('Gagal menambahkan pengeluaran');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }

    validateNumber(event: KeyboardEvent) {
      const charCode = event.which ? event.which : event.keyCode;
      if (charCode < 48 || charCode > 57) {
        event.preventDefault(); // Mencegah karakter selain angka
      }
    }


}
