import { Component, OnInit } from '@angular/core';
import { 
  IonIcon, IonAlert, IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  addOutline, searchOutline, createOutline, trashOutline, 
  cubeOutline, eyeOutline, closeOutline, listOutline,
  checkboxOutline, radioButtonOnOutline, chevronForwardOutline,
  chevronBackOutline
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from 'src/app/services/product.service';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AlertController } from '@ionic/angular';

export interface Addon {
  id: number;
  addon_name: string;
  addon_price: string;
  qty: number;
  product_name: string;
}

@Component({
  selector: 'app-produk',
  standalone: true,
  templateUrl: './produk.page.html',
  styleUrls: ['./produk.page.scss'],
  imports: [
    IonIcon, IonSkeletonText,
    CommonModule, FormsModule,
  ],
})


export class ProdukPage implements OnInit {
  // PRODUCT PAGINATION
page = 1;
limit = 10;
total = 0;
totalPages = 0;

// ADDON PAGINATION
addonPage = 1;
addonLimit = 5;
addonTotal = 0;
addonTotalPages = 0;

search = '';
categoryId = '';
stockFilter = '';
showAddModal = false;
showDetailModal = false;
detailProduct: any = null;
categories: any[] = [];
searchTimeout: any;

newProduct: any = {
  product_code: '',
  category_id: '',
  product_name: '',
  image: null,
  price: 0,
  point_price: 0,
  qty: 0,
  is_active: 1,
  is_exchangeable: 1,
  addons: []
  
};


  products: Product[] = [];
  addons: Addon[] = [];   // ⬅️ TAMBAH INI

  loading = true;
  loadingAddon = true;    // ⬅️ TAMBAH

  constructor(
    private productService: ProductService, 
    private alertCtrl: AlertController
  ) {
    addIcons({ 
      'add-outline': addOutline, 
      'search-outline': searchOutline, 
      'create-outline': createOutline, 
      'trash-outline': trashOutline, 
      'cube-outline': cubeOutline, 
      'eye-outline': eyeOutline, 
      'close-outline': closeOutline, 
      'list-outline': listOutline, 
      'checkbox-outline': checkboxOutline, 
      'radio-button-on-outline': radioButtonOnOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'chevron-back-outline': chevronBackOutline
    });
  }

  ngOnInit() {
    this.loadData();
    this.loadAddons();   // ⬅️ PANGGIL
    this.loadCategories(); // ⬅️ TAMBAH UNTUK FILTER
  }

loadData() {
  this.loading = true;

  this.productService
    .getProducts(this.page, this.limit, this.search, this.categoryId, this.stockFilter)
    .pipe(
      finalize(() => {
        this.loading = false; // langsung mati
      })
    )
    .subscribe({
      next: (res: any) => {
        this.products = res.data ?? [];
        this.total = res.meta?.total ?? 0;
        this.totalPages = res.meta?.total_pages ?? 1;
      },
      error: (err) => {
        console.error('Gagal ambil produk:', err);
      }
    });
}

onSearchChange() {
  if (this.searchTimeout) {
    clearTimeout(this.searchTimeout);
  }

  this.searchTimeout = setTimeout(() => {
    this.page = 1;
    this.loadData();
  }, 500);
}

onCategoryChange() {
  this.page = 1;
  this.loadData();
}

onStockFilterChange() {
  this.page = 1;
  this.loadData();
}




loadAddons() {
  this.loadingAddon = true;

  this.productService.getAddons(this.addonPage, this.addonLimit)
    .subscribe({
      next: (res) => {
        this.addons = res.data;

        this.addonTotal = res.meta.total;
        this.addonTotalPages = res.meta.total_pages;

        this.loadingAddon = false;
      },
      error: (err) => {
        console.error('Gagal ambil addon:', err);
        this.loadingAddon = false;
      }
    });
}


  formatPrice(v: string) {
    return Number(v).toLocaleString('id-ID');
  }

  nextPage() {
  if (this.page < this.totalPages) {
    this.page++;
    this.loadData();
  }
}

prevPage() {
  if (this.page > 1) {
    this.page--;
    this.loadData();
  }
}


openAddModal() {
  this.isEdit = false;
  this.editId = null;
  this.showAddModal = true;
  this.loadCategories();

  // reset form
  this.newProduct = {
    product_code: '',
    category_id: '',
    product_name: '',
    image: null,
    price: 0,
    point_price: 0,
    qty: 0,
    is_active: 1,
    is_exchangeable: 1,
    addons: []
  };

  this.imagePreview = null;

  // GENERATE CODE
  this.generateProductCode();
}

openDetailModal(p: any) {
  this.detailProduct = p;
  this.showDetailModal = true;
}

closeDetailModal() {
  this.showDetailModal = false;
  this.detailProduct = null;
}

loadCategories() {
  this.productService.getCategories().subscribe(res => {
    this.categories = res.data;
  });
}


closeAddModal() {
  this.showAddModal = false;
  this.isEdit = false;
  this.editId = null;
}

saveProduct() {
  if (!this.validateForm()) return;

  const formData = new FormData();

  formData.append('product_code', this.newProduct.product_code);
  formData.append('category_id', this.newProduct.category_id);
  formData.append('product_name', this.newProduct.product_name);
  formData.append('price', this.newProduct.price);
  formData.append('point_price', this.newProduct.point_price);
  formData.append('qty', this.newProduct.qty);
  formData.append('is_active', this.newProduct.is_active);
  formData.append('is_exchangeable', this.newProduct.is_exchangeable);
  formData.append('addons', JSON.stringify(this.newProduct.addons));

  // FILE WAJIB DIPISAH
  if (this.newProduct.image) {
    formData.append('image', this.newProduct.image);
  }

  this.productService.createProduct(formData).subscribe({
    next: () => {
      this.closeAddModal();
      this.loadData();
    },
    error: err => console.error(err)
  });
}



imagePreview: any = null;

onFileChange(e: any) {
  const file = e.target.files[0];
  this.newProduct.image = file;

  if (file) {
    const reader = new FileReader();
    reader.onload = () => this.imagePreview = reader.result;
    reader.readAsDataURL(file);
  }
}

async confirmDelete(id: string | number) {
  const alert = await this.alertCtrl.create({
    header: 'Hapus Produk?',
    message: 'Data produk akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.',
    cssClass: 'premium-alert',
    buttons: [
      {
        text: 'Batal',
        role: 'cancel',
        cssClass: 'alert-button-cancel'
      },
      {
        text: 'Hapus',
        role: 'destructive',
        cssClass: 'alert-button-confirm',
        handler: () => {
          this.deleteProduct(id);
        }
      }
    ]
  });
  await alert.present();
}

deleteProduct(id: string | number) {
  this.loading = true;

  this.productService.deleteProduct(id).subscribe({
    next: () => {
      this.loadData();
    },
    error: (err) => {
      console.error(err);
      this.loading = false;
    }
  });
}


generateProductCode() {
  this.productService.getGenerateCode().subscribe({
    next: (res) => {
      if (res.success) {
        this.newProduct.product_code = res.code;
      }
    },
    error: (err) => console.error(err)
  });
}

isEdit = false;
editId: number | null = null;


openEditModal(p: any) {
  this.isEdit = true;
  this.showAddModal = true;
  this.editId = p.id;

  this.loadCategories();

  this.newProduct = {
    product_code: p.product_code,
    category_id: p.category_id,
    product_name: p.product_name,
    image: null,
    price: p.price,
    point_price: p.point_price,
    qty: p.qty,
    is_active: p.is_active,
    is_exchangeable: p.is_exchangeable,
    addons: p.addons ? JSON.parse(JSON.stringify(p.addons)) : [],
    old_image: p.image // Simpan nama file lama untuk backend
  };

  if (p.image) {
    this.imagePreview = 'http://localhost:8080/uploads/products/' + p.image;
  } else {
    this.imagePreview = null;
  }
}

updateProduct() {
  if (!this.validateForm()) return;

  const formData = new FormData();

  Object.keys(this.newProduct).forEach(key => {
    if (key === 'image') {
      // Hanya kirim image jika user memilih file baru
      if (this.newProduct.image instanceof File) {
        formData.append('image', this.newProduct.image);
      }
      // Jika null (tidak ganti foto), jangan kirim — server pertahankan foto lama
    } else if (key === 'addons') {
      formData.append('addons', JSON.stringify(this.newProduct.addons));
    } else if (key === 'old_image') {
      // Kirim nama file lama jika ada
      if (this.newProduct.old_image) {
        formData.append('old_image', this.newProduct.old_image);
      }
    } else if (this.newProduct[key] !== null && this.newProduct[key] !== undefined) {
      formData.append(key, this.newProduct[key]);
    }
  });

  this.productService.updateProduct(this.editId, formData).subscribe({
    next: () => {
      this.closeAddModal();
      this.loadData();
    },
    error: err => console.error(err)
  });
}

  // ============ ADDON FORM LOGIC ============
  addAddonGroup() {
    this.newProduct.addons.push({
      group_name: '',
      selection_type: 'single',
      is_required: false,
      items: [
        { addon_name: '', addon_price: 0, point_price: 0, qty: 0 }
      ]
    });
  }

  removeAddonGroup(index: number) {
    this.newProduct.addons.splice(index, 1);
  }

  addAddonItem(groupIndex: number) {
    this.newProduct.addons[groupIndex].items.push({ addon_name: '', addon_price: 0, point_price: 0, qty: 0 });
  }

  removeAddonItem(groupIndex: number, itemIndex: number) {
    this.newProduct.addons[groupIndex].items.splice(itemIndex, 1);
  }

  // ============ VALIDATION ============
  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'premium-alert'
    });
    await alert.present();
  }

  validateForm(): boolean {
    const p = this.newProduct;
    
    // 1. Check Mandatory Fields
    if (!p.product_name || !p.product_code || !p.category_id) {
      this.showAlert('Data Tidak Lengkap', 'Nama, Kode Produk, dan Kategori wajib diisi.');
      return false;
    }

    if (p.price === null || p.price === undefined || p.price === '') {
      this.showAlert('Harga Kosong', 'Harga jual harus diisi.');
      return false;
    }

    // 2. Check Unique Name (Local check against current list)
    const isDuplicate = this.products.some(item => 
      item.product_name.toLowerCase().trim() === p.product_name.toLowerCase().trim() && 
      (!this.isEdit || item.id !== this.editId)
    );

    if (isDuplicate) {
      this.showAlert('Nama Sudah Digunakan', `Produk dengan nama "${p.product_name}" sudah ada di daftar ini.`);
      return false;
    }

    return true;
  }
}
