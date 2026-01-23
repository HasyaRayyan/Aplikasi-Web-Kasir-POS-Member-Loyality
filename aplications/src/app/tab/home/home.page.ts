import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonModal, IonRouterOutlet } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { CapacitorHttp } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { StorageService } from 'src/app/storage.service';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { AlertController, ModalController } from '@ionic/angular'; // Import AlertController
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
interface Item {
  id: string;  // Sesuaikan dengan tipe data yang kamu terima
  name: string;
  id_category: string;
}
interface Topping {
  id: string;
  id_outlet: string;
  id_category: string;
  id_parent_item: string;
  name: string;
  description: string;
  img_url: string;
  price: string;
  qty: string;
  sale_price: string;
  status: string;
  selected: boolean;  // Menambahkan properti selected
}
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})

export class HomePage implements OnInit, OnDestroy {
  @ViewChild('itemModal') itemModal!: IonModal;
  @ViewChild('addItemModal') addItemModal!: IonModal;
  @ViewChild(IonRouterOutlet, { static: true }) ionRouterOutlet!: IonRouterOutlet;
  @ViewChild('detailModal') detailModal!: IonModal;
  private checkoutSub!: Subscription;
  selectedFilter: string = 'All';
  selectedItem: any = null;
  qty: number = 1;
  cartCount: number = 0;
  searchQuery: string = '';
  productId: number = 0;
  items: any[] = [];
  filteredItems: any[] = [];
  categories: any[] = [];
  categoriesForFilter: any[] = [];
  categoriesList: any[] = [];
  isDiscountEnabled: boolean = true; // Default true, nanti di-load dari localStorage

  // Deklarasi toppingData dengan id_category sebagai array of string
  toppingData = {
    id_category: [] as string[],  // Pastikan id_category adalah array
    name: '',
    price: '',
    selectedItems: []  // Array untuk menyimpan selectedItems
  };
  toppings: Topping[] = [];

  itemData: {
    id_category: string;
    name: string;
    description: string;
    price: string;
    point_sale: string;
    photo: string | undefined;
    qty: 0;
  } = {
    id_category: '',
    name: '',
    description: '',
    price: '',
    point_sale: '',
    photo: '',
    qty: 0,
  };
  selectedToppings: Topping[] = [];  // Menyimpan topping yang dipilih
  isToppingEnabled: boolean = false;
  item: any;
  isEditItemModalOpen = false;
  nullParentItems: Item[] = [];
  addToppingModal: any;
  id_outlet: string = '';
  outlet_name: string = '';
  user_level: string = '';
  discountType: string = 'nominal';
  constructor(public router: Router,private route: ActivatedRoute, private cartService: CartService, private storageService: StorageService,    private cdr: ChangeDetectorRef, private cd: ChangeDetectorRef, private alertController: AlertController) {
    this.router.events.subscribe(() => {
      const navigation = this.router.getCurrentNavigation();
      if (navigation && navigation.extras.state && navigation.extras.state['deletedItemId']) {
        this.removeDeletedItem(navigation.extras.state['deletedItemId']);
      }
    });
  }

  ngOnDestroy() {
    if (this.checkoutSub) this.checkoutSub.unsubscribe();
  }

  ngOnInit() {
    this.loadUserData();
    this.getCategories();
    this.getListCategories();
    this.getItems();
    this.fetchItemsWithNullParent();
    this.cdr.detectChanges();
    this.cartService.cartItems$.subscribe((items) => {
        this.cartCount = items.length;
    });

    this.id_outlet = this.storageService.getOutletId();
    this.outlet_name = this.storageService.getOutletCode();
    this.user_level = this.storageService.getUserLevel();
    this.loadDiscountStatus();
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
        this.selectedItem = navigation.extras.state['item'];
        this.productId = this.selectedItem?.id;
        this.getToppingsByProduct(this.productId);
    } else {
    }
    const storedToppingStatus = localStorage.getItem('isToppingEnabled');
    this.isToppingEnabled = storedToppingStatus ? JSON.parse(storedToppingStatus) : true;
    this.checkoutSub = this.cartService.checkout$.subscribe(updated => {
      if (updated) {
        this.getItems();
        this.cdr.detectChanges();
      }
    });
}

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  loadUserData() {
    const storedUserData = localStorage.getItem('user_data');

    if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        this.id_outlet = userData.userData.id_outlet;
        this.getItems();
    } else {
        this.presentAlert('Error', 'No user data found in localStorage');
    }
}


  async getToppingsByProduct(productId: number) {
    if (!this.isToppingEnabled) {
      this.toppings = [];
      return;
    }

    try {
      const response = await CapacitorHttp.get({
        url: `https://epos.pringapus.com/api/v1/Product_category/get_toppings_by_product/${productId}`,
        headers: { 'Content-Type': 'application/json' },
      });

      const parsedData = JSON.parse(response.data);
      console.log('📡 Response API:', parsedData);

      if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
        this.toppings = parsedData.data
          .filter((topping: Topping) => String(topping.id_parent_item) === String(productId))
          .map((topping: Topping) => ({ ...topping, selected: false }));
        console.log('✅ Topping setelah parsing:', this.toppings);
        this.toppings = [...this.toppings];
      } else {
        console.log('Tidak ada data topping.');
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat mengambil topping:', error);
    }
  }

  toggleToppingStatus() {
    this.isToppingEnabled = !this.isToppingEnabled;
    localStorage.setItem('isToppingEnabled', JSON.stringify(this.isToppingEnabled));
    if (this.itemModal) {
      this.itemModal.dismiss();
      setTimeout(() => {
        this.itemModal.present();
        this.refreshToppings();
      }, 300);
    }
  }

  async ionViewWillEnter() {
    this.getCategories();
    this.loadDiscountStatus();
    const storedStatus = localStorage.getItem('isToppingEnabled');
    this.isToppingEnabled = storedStatus ? JSON.parse(storedStatus) : true;
    if (this.isToppingEnabled && this.productId) {
      await this.getToppingsByProduct(this.productId);
    } else {
      this.toppings = [];
      console.log('Topping dinonaktifkan, tidak ada topping.');
    }
  }
  async onItemModalOpenAndRefreshToppings() {
    console.log('Modal dibuka, cek ulang status topping.');
    if (this.isToppingEnabled && this.productId) {
      console.log('Topping aktif, mengambil topping untuk productId:', this.productId);
      await this.refreshToppings();
    } else {
      console.log('Topping dinonaktifkan, tidak mengambil data.');
      this.toppings = [];
    }
  }

  async refreshToppings() {
    this.isToppingEnabled = JSON.parse(localStorage.getItem('isToppingEnabled') || 'true');

    if (this.isToppingEnabled && this.productId) {
      await this.getToppingsByProduct(this.productId);
      setTimeout(() => {
        this.cd.detectChanges();
      }, 100);
    } else {
      this.toppings = [];
    }
  }

  onItemModalOpen() {
    if (this.productId && this.isToppingEnabled) {
      this.getToppingsByProduct(this.productId);
    }
  }

  toggleToppingSelection(topping: Topping) {
    topping.selected = !topping.selected;
  }

  calculateTotal(): number {
    if (!this.selectedItem) return 0;

    let hargaFinal = this.selectedItem.price;
    let discountAmount = 0;

    if (this.isDiscountEnabled && this.selectedItem.sale_price > 0) {
      hargaFinal = this.selectedItem.sale_price;
      discountAmount = (this.selectedItem.price - this.selectedItem.sale_price) * this.qty;
    }

    let totalPrice = hargaFinal * this.qty;

    this.toppings.filter(t => t.selected).forEach(topping => {
      totalPrice += parseFloat(topping.price);
    });

    return totalPrice;
  }


addToCart() {
  const selectedToppings = this.toppings.filter(topping => topping.selected);
  const discountAmount = this.selectedItem.sale_price > 0 ? (this.selectedItem.price - this.selectedItem.sale_price) * this.qty : 0;

  this.cartService.addToCart(
    {
      ...this.selectedItem,
      original_price: this.selectedItem.price,
      price         : this.selectedItem.price,
      point_sale         : this.selectedItem.point_sale,
      discount      : discountAmount
    },
    this.qty,
    selectedToppings
  );

  this.itemModal.dismiss();
}

loadDiscountStatus() {
  const storedDiscount = localStorage.getItem('isDiscountEnabled');
  this.isDiscountEnabled = storedDiscount ? JSON.parse(storedDiscount) : true;
  console.log('✅ Diskon status loaded:', this.isDiscountEnabled);
  this.cdr.detectChanges();
}


getDiscountPercentage(): number {
  if (!this.selectedItem || this.selectedItem.sale_price == 0) return 0;
  let hargaNormal = parseFloat(this.selectedItem.price);
  let hargaDiskon = parseFloat(this.selectedItem.sale_price);
  return Math.round(((hargaNormal - hargaDiskon) / hargaNormal) * 100);
}

  async getListCategories() {
    try {
      const response = await CapacitorHttp.get({
        url: 'https://epos.pringapus.com/api/v1/Product_category/getProductCategoryList',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (Array.isArray(response.data.data)) {
        this.categoriesList = response.data.data;
        this.cdr.detectChanges();
      } else {
        console.error('Data kategori tidak dalam format array:', response.data.data);
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat mengambil kategori:', error);
    }
  }

  customCounterFormatter(inputLength: number, maxLength: number) {
    return `${maxLength - inputLength} Karakter tersisa`;
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
        this.categories = response.data.data;
        this.categoriesForFilter = [{ id: 'All', name: 'All' }, ...this.categories];
        this.cdr.detectChanges();
      } else {
        console.error('Data kategori tidak dalam format array:', response.data.data);
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat mengambil kategori:', error);
    }
  }

  async getItems() {
    try {
      if (!this.id_outlet) {
        console.error('ID Outlet tidak ditemukan');
        this.presentAlert('Error', 'ID Outlet tidak tersedia.');
        return;
      }

      console.log('Mengambil produk untuk ID Outlet:', this.id_outlet);

      const response = await CapacitorHttp.get({
        url: `https://epos.pringapus.com/api/v1/Product_category/get_products?id_outlet=${this.id_outlet}`,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response API:', response.data);

      if (response.data && response.data.status) {
        console.log('Produk berhasil diambil:', response.data.data);
        this.items = response.data.data;
        this.filteredItems = [...this.items];
        this.cdr.detectChanges();
      } else {
        console.error('Data produk tidak ditemukan:', response.data.message);
        this.presentAlert('Info', response.data.message);
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat mengambil produk:', error);
      this.presentAlert('Error', 'Gagal mengambil produk.');
    }
  }
    async updateItem() {
      try {
        if (!this.selectedItem.id_item && !this.selectedItem.id) {
          console.error('❌ ID Item tidak ditemukan:', this.selectedItem);
          this.presentAlert('Error', 'ID Item tidak tersedia.');
          return;
        }

        let finalPrice = Number(this.selectedItem.price) || 0;

        if (this.selectedItem.discount !== undefined && this.selectedItem.discount !== null && this.selectedItem.discount !== '') {
          const discount = Number(this.selectedItem.discount) || 0;
          if (this.discountType === 'nominal') {
            finalPrice = finalPrice - discount;
          } else if (this.discountType === 'percent') {
            finalPrice = finalPrice - (finalPrice * (discount / 100));
          }
          finalPrice = Math.max(0, finalPrice);
        }

        if (this.selectedItem.photo && this.selectedItem.photo.webPath) {
          const response = await fetch(this.selectedItem.photo.webPath);
          const blob = await response.blob();
          const resizedBlob = await this.resizeImage(blob, 500, 500);
          const fileName = `Img_${Date.now()}.jpg`;

          const formData = new FormData();
          formData.append('file', resizedBlob, fileName);
          formData.append('id_outlet', this.id_outlet);
          formData.append('outlet_name', this.outlet_name);

          const uploadResponse = await fetch('https://epos.pringapus.com/api/v1/Product_category/uploadImage', {
            method: 'POST',
            body: formData
          });

          const result = await uploadResponse.json();
          console.log('📸 Upload image response:', result);
          if (result.status) {
            this.selectedItem.photo = result.file_url;
          } else {
            console.warn('⚠️ Gagal upload gambar:', result.message);
          }
        }

        const updateData: any = {
          id_item: this.selectedItem.id_item || this.selectedItem.id,
          name: this.selectedItem.name,
          description: this.selectedItem.description,
          price: Number(this.selectedItem.price) || 0,
          sale_price: finalPrice,
          img_url: this.selectedItem.photo || null,
          qty: Number(this.selectedItem.qty) || 0 
        };

        console.log('🚀 Mengirim update untuk ID Item:', updateData);

        const response = await CapacitorHttp.post({
          url: 'https://epos.pringapus.com/api/v1/Product_category/updateItem',
          headers: { 'Content-Type': 'application/json' },
          data: updateData,
        });

        console.log('✅ Response API:', response.data);

        if (response.data && response.data.status) {
          this.presentAlert('Sukses', 'Item berhasil diperbarui.');
          this.getItems();
          this.selectedItem.qty = 0;
          this.closeEditItemModal();
        } else {
          console.error('⚠️ Gagal memperbarui item:', response.data.message);
          this.presentAlert('Error', response.data.message);
        }
      } catch (error) {
        console.error('❗ Error saat update item:', error);
        this.presentAlert('Error', 'Gagal memperbarui item.');
      }
    }


  async choosePhotoEdit() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
         source: CameraSource.Photos
      });

      if (image.webPath) {
        const response = await fetch(image.webPath!);
        const blob = await response.blob();
        const resizedBlob = await this.resizeImage(blob, 500, 500);
        const fileType = resizedBlob.type || 'image/jpeg';

        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(fileType)) {
          console.error('Format gambar tidak didukung');
          return;
        }

        const fileName = `Img_${Date.now()}.jpg`;
        const formData = new FormData();
        formData.append('file', resizedBlob, fileName);
        formData.append('id_outlet', this.id_outlet);
        formData.append('outlet_name', this.outlet_name);

        const uploadResponse = await fetch('https://epos.pringapus.com/api/v1/Product_category/uploadImage', {
          method: 'POST',
          body: formData
        });

        const result = await uploadResponse.json();

        if (result.status) {
          this.selectedItem.photo = result.file_url; // Set foto ke selectedItem
          console.log('✅ Foto berhasil diunggah:', result.file_url);
        } else {
          console.error('❌ Gagal mengunggah foto:', result.message);
        }
      }
    } catch (error) {
      console.error('Error memilih atau mengunggah gambar:', error);
    }
  }


  openEditItemModal(item: any) {
    this.selectedItem = { ...item };

    // Atur Gambar dari img_url
    if (item.img_url) {
      this.selectedItem.photo = item.img_url;
    } else {
      this.selectedItem.photo = null;
    }

    // Hitung Diskon jika ada
    const price = Number(item.price);
    const salePrice = Number(item.sale_price);

    if (salePrice && salePrice < price) {
      const discountNominal = price - salePrice;
      const discountPercent = Math.round((discountNominal / price) * 100);

      // Otomatis pilih tipe diskon
      if (discountNominal % 1000 === 0) {
        this.discountType = 'nominal';
        this.selectedItem.discount = discountNominal;
      } else {
        this.discountType = 'percent';
        this.selectedItem.discount = discountPercent;
      }
    } else {
      // Tidak ada diskon
      this.discountType = 'nominal';
      this.selectedItem.discount = null;
    }

    this.isEditItemModalOpen = true;
  }

  closeEditItemModal() {
    this.isEditItemModalOpen = false;
  }
  openModal(item: any) {
    this.selectedItem = item;
    this.qty = 1;
    this.toppings = [];  // Reset toppings saat membuka modal
    this.getToppingsByProduct(item.id);  // Ambil topping berdasarkan productId
    this.itemModal.present();
  }


removeDeletedItem(id: string) {
  this.items = this.items.filter(item => item.id !== id);
  this.filteredItems = [...this.items]; // Update tampilan langsung
}



  openDetailPage(item: any) {
    this.selectedItem = item;
    this.router.navigate(['/detail'], { state: { item } });
  }

  incrementQty() {
    this.qty += 1;
  }

  selectFilter(filter: string) {
    this.selectedFilter = filter;

    if (filter === 'All') {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter((item) => item.id_category === filter);
    }
  }

  decrementQty() {
    if (this.qty > 1) {
      this.qty -= 1;
    }
  }

  // calculateTotal(): number {
  //   return this.selectedItem ? this.selectedItem.price * this.qty : 0;
  // }


  // Fungsi untuk menangani perubahan pencarian produk
  onSearchChange(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredItems = this.items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) &&
        (this.selectedFilter === 'All' || item.category_id === this.selectedFilter)
    );
  }

  /////////////jangan dihapuscommentnya
  //  source: CameraSource.Prompt
  //  source: CameraSource.Photos
  /////////////jangan dihapuscommentnya
  async choosePhoto() {
    try {
        const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.Uri,
            // source: CameraSource.Prompt
            source: CameraSource.Photos
        });

        if (image.webPath) {
            await this.uploadImage(image);
        }
    } catch (error) {
        console.error('Error memilih gambar:', error);
    }
  }
// const resizedBlob = await this.resizeImage(blob, 500, 500);
async uploadImage(image: any) {
  try {
      const response = await fetch(image.webPath!);
      const blob = await response.blob();
      const resizedBlob = await this.resizeImage(blob, 500, 500);
      const fileType = resizedBlob.type || 'image/jpeg';

      if (fileType !== 'image/jpeg' && fileType !== 'image/jpg' && fileType !== 'image/png') {
          console.error('Format gambar tidak didukung. Harap unggah file JPG atau PNG.');
          return;
      }

      // const fileName = `Img_${Date.now()}.${fileType.split('/')[1]}`;
      const fileName = `Img_${Date.now()}.jpg`;
      const formData = new FormData();
      formData.append('file', blob, fileName);
      formData.append('id_outlet', this.id_outlet);
      formData.append('outlet_name', this.outlet_name);

      const uploadResponse = await fetch('https://epos.pringapus.com/api/v1/Product_category/uploadImage', {
          method: 'POST',
          body: formData
      });

      const result = await uploadResponse.json();
      console.log('Response dari upload:', result);

      if (result.status) {
          console.log('Gambar berhasil diunggah:', result.file_url);
          this.itemData.photo       = result.file_url;
      } else {
          console.error('Gagal mengunggah gambar:', result.message);
      }

  } catch (error) {
      console.error('Error saat mengunggah gambar:', error);
  }
}


  async resizeImage(blob: Blob, width: number, height: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);
            canvas.toBlob((resizedBlob) => {
                if (resizedBlob) {
                    resolve(resizedBlob);
                } else {
                    reject(new Error('Gagal mengubah ukuran gambar'));
                }
            }, blob.type);
        };

        img.onerror = (err) => reject(err);
        img.src = URL.createObjectURL(blob);
    });
  }

  async addProduct() {
    const formData = {
        id_outlet   : this.id_outlet,
        id_category : this.itemData.id_category,
        name        : this.itemData.name,
        description : this.itemData.description,
        price       : this.itemData.price,
        point_sale       : this.itemData.point_sale,
        img_url     : this.itemData.photo,
        qty         : this.itemData.qty,
    };

    console.log('hasil request', formData)

    console.log('data request ser'+formData);
    try {
        const response = await CapacitorHttp.post({
            url: 'https://epos.pringapus.com/api/v1/product_category/addProduct',
            headers: { 'Content-Type': 'application/json' },
            data: formData
        });

        const result = response.data;
        console.log('Response dari API:', response.data);
        if (result.status) {
            console.log('Produk berhasil ditambahkan');
            this.closeAddItemModal();
            this.presentAlert('Sukses', 'Produk berhasil ditambahkan');
            this.getCategories();
            this.getListCategories();
            this.getItems();
            this.fetchItemsWithNullParent();
            this.cd.detectChanges();
            this.itemData.id_category = '';
            this.itemData.name        = '';
            this.itemData.description = '';
            this.itemData.price       = '';
            this.itemData.point_sale       = '';
            this.itemData.photo       = '';

            this.addItemModal.dismiss();
        } else {
            console.error('Gagal menambahkan produk:', result.message);
        }
    } catch (error) {
        console.error('Error saat menambahkan produk:', error);
    }
  }
  selectItem(event: any) {
    const selectedItemIds = event.detail.value; // Ambil semua ID yang dipilih

    // Ambil id_category dari setiap item yang dipilih
    const selectedCategories = selectedItemIds.map((id: string) => {
      const selectedItem = this.nullParentItems.find(item => item.id === id);
      return selectedItem ? selectedItem.id_category : null;
    }).filter((category: any) => category !== null); // Menambahkan tipe 'any' pada parameter 'category'

    // Pastikan id_category adalah array dengan nilai yang valid
    this.toppingData.id_category = selectedCategories;
  }

// Fungsi untuk memeriksa apakah tombol harus di-disable berdasarkan stok
isButtonDisabled(): boolean {
  // Periksa apakah selectedItem ada dan memiliki properti stock/qty
  if (!this.selectedItem || typeof this.selectedItem.qty === 'undefined') {
    return true; // Disable tombol jika item tidak ada atau tidak memiliki informasi stok
  }

  // Disable tombol jika stok kurang dari 1
  return this.selectedItem.qty < 1;
}

  async fetchItemsWithNullParent() {
    try {
        if (!this.id_outlet) {
            console.error('ID Outlet tidak ditemukan');
            this.presentAlert('Error', 'ID Outlet tidak tersedia.');
            return;
        }

        const response = await CapacitorHttp.get({
            url: `https://epos.pringapus.com/api/v1/Product_category/getItemsWithNullParent?id_outlet=${this.id_outlet}`,
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('Response API (fetchItemsWithNullParent):', response.data);

        if (response.data && response.data.status) {
            this.nullParentItems = response.data.data;
        } else {
            console.error('Data tidak ditemukan:', response.data.message);
        }
    } catch (error) {
        console.error('Error mengambil item dengan parent_id null:', error);
    }
}


  async addTopping() {
    if (!this.toppingData.name || !this.toppingData.price || !this.toppingData.selectedItems.length || !this.toppingData.id_category) {
      console.error('Semua field harus diisi!');
      return;
    }

    const formData = {
      id_outlet: this.id_outlet,
      id_category: JSON.stringify(this.toppingData.id_category), // Ubah array menjadi JSON string
      name: this.toppingData.name,
      price: this.toppingData.price,
      id_parent_items: this.toppingData.selectedItems
    };

    console.log('Data request:', formData);
    try {
      const response = await CapacitorHttp.post({
        url: 'https://epos.pringapus.com/api/v1/Product_category/addTopping',
        headers: { 'Content-Type': 'application/json' },
        data: formData
      });

      const result = response.data;
      console.log('Response dari API:', result);

      if (result.status) {
        console.log('Topping berhasil ditambahkan');
        this.presentAlert('Sukses', 'Toping berhasil ditambahkan');
        this.closeAddItemModal();
        this.getItems(); // Update item list
        this.toppingData = { id_category: [], name: '', price: '', selectedItems: [] };
        if (this.addToppingModal) this.addToppingModal.dismiss();
      } else {
        console.error('Gagal menambahkan topping:', result.message);
      }
    } catch (error) {
      console.error('Error saat menambahkan topping:', error);
    }
  }

  async deleteProduct(id: string) {
    if (!id) {
      console.error('ID produk tidak ditemukan');
      return;
    }

    console.log("Menghapus produk dengan ID:", id);

    const userConfirm = window.confirm("Apakah Anda yakin ingin menghapus produk ini?");
    if (!userConfirm) return;

    try {
      const response = await CapacitorHttp.post({
        url: `https://epos.pringapus.com/api/v1/Product_category/deleteProduct/${id}`, // ID di URL
        headers: { 'Content-Type': 'application/json' }
      });

      console.log("Response dari server:", response);

      if (response.data.status) {
        console.log('Produk berhasil dihapus');
        this.router.navigate(['tab/home'], { state: { deletedItemId: id } });
      } else {
        console.error('Gagal menghapus produk:', response.data.message);
      }
    } catch (error) {
      console.error('Error saat menghapus produk:', error);
    }
  }


  openAddItemModal() {
    if (this.addItemModal) {
      this.addItemModal.present();
    }
  }

  closeAddItemModal() {
    this.addItemModal.dismiss();
  }

  setDefaultImage(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/image-not-found.png';
  }

  closePhoto() {
    this.itemData.photo = undefined;
  }

  validateNumber(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault(); // Mencegah karakter selain angka
    }
  }


}
