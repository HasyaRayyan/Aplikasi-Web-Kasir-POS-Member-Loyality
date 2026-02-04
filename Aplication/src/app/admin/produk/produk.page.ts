import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
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
    IonicModule,
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
showAddModal = false;
categories: any[] = [];

newProduct: any = {
  product_code: '',
  category_id: '',
  product_name: '',
  image: null,
  price: 0,
  qty: 0,
  is_active: 1
  
};


  products: Product[] = [];
  addons: Addon[] = [];   // ⬅️ TAMBAH INI

  loading = true;
  loadingAddon = true;    // ⬅️ TAMBAH

  constructor(private productService: ProductService, private alertCtrl: AlertController) {}

  ngOnInit() {
    this.loadData();
    this.loadAddons();   // ⬅️ PANGGIL
  }

loadData() {
  this.loading = true;

  this.productService
    .getProducts(this.page, this.limit, this.search)
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
  this.showAddModal = true;
  this.loadCategories();

  // reset form
  this.newProduct = {
    product_code: '',
    category_id: '',
    product_name: '',
    image: null,
    price: 0,
    qty: 0,
    is_active: 1
  };

  this.imagePreview = null;

  // GENERATE CODE
  this.generateProductCode();
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
  const formData = new FormData();

  formData.append('product_code', this.newProduct.product_code);
  formData.append('category_id', this.newProduct.category_id);
  formData.append('product_name', this.newProduct.product_name);
  formData.append('price', this.newProduct.price);
  formData.append('qty', this.newProduct.qty);
  formData.append('is_active', this.newProduct.is_active);

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
    header: 'Hapus Produk',
    message: 'Yakin ingin menghapus produk ini?',
    buttons: [
      {
        text: 'Batal',
        role: 'cancel'
      },
      {
        text: 'Hapus',
        role: 'destructive',
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
    qty: p.qty,
    is_active: p.is_active
  };

  if (p.image) {
    this.imagePreview = 'http://localhost:8080/uploads/products/' + p.image;
  } else {
    this.imagePreview = null;
  }
}

updateProduct() {
  const formData = new FormData();

  Object.keys(this.newProduct).forEach(key => {
    if (this.newProduct[key] !== null) {
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



}
