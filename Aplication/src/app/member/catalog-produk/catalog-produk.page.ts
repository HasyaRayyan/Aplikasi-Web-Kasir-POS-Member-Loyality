import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonIcon } from '@ionic/angular/standalone';
import { environment } from 'src/environments/environment';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from 'src/app/services/product.service';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-catalog-produk',
  templateUrl: './catalog-produk.page.html',
  styleUrls: ['./catalog-produk.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, 
    IonIcon,
    CommonModule, FormsModule, RouterModule
  ]
})
export class CatalogProdukPage implements OnInit {

  allProducts: any[] = [];
  products: any[] = [];
  categories: any[] = [];
  
  loadingProducts = true;
  loadingCategories = true;
  
  searchQuery = '';
  selectedCategoryId: number | 'all' = 'all';
  
  apiUrl = environment.apiBaseUrl;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.fetchCategories();
    this.fetchProducts();
  }

  fetchCategories() {
    this.loadingCategories = true;
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories = res?.data ? res.data : (Array.isArray(res) ? res : []);
        this.loadingCategories = false;
      },
      error: () => {
        this.loadingCategories = false;
      }
    });
  }

  fetchProducts() {
    this.loadingProducts = true;
    
    // We fetch a high limit or using kasir endpoint that usually fetches active ones.
    // getProducts(page, limit) -> Assuming it returns { status, data: { data: [] } } or similar structure
    this.productService.getProducts(1, 1000).subscribe({
      next: (res) => {
        // Handle standard Laravel pagination structure or direct array
        let fetchedProducts = [];
        if (res?.data && res.data.data) {
            fetchedProducts = res.data.data;
        } else if (res?.data && Array.isArray(res.data)) {
            fetchedProducts = res.data;
        } else {
            fetchedProducts = Array.isArray(res) ? res : [];
        }

        // Filter only ACTIVE products ("1" or 1)
        const activeOnly = fetchedProducts.filter((p: any) => p.is_active == 1);

        this.allProducts = activeOnly.map((p: any) => ({
          ...p,
          isNew: this.checkIsNew(p.created_at),
          imageUrl: p.image ? `${this.apiUrl}/uploads/products/${p.image}` : null
        }));
        
        this.applyFilters();
        this.loadingProducts = false;
      },
      error: () => {
        this.loadingProducts = false;
      }
    });
  }

  selectCategory(id: number | 'all') {
    this.selectedCategoryId = id;
    this.applyFilters();
  }

  handleSearch(event: any) {
    this.searchQuery = event.target.value?.toLowerCase() || '';
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allProducts];

    // Filter by Category
    if (this.selectedCategoryId !== 'all') {
      filtered = filtered.filter(p => p.category_id == this.selectedCategoryId);
    }

    // Filter by Search Query
    if (this.searchQuery) {
      filtered = filtered.filter(p => 
        p.product_name.toLowerCase().includes(this.searchQuery)
      );
    }

    this.products = filtered;
  }

  checkIsNew(createdAt: string | undefined): boolean {
    if (!createdAt) return false;
    
    // Fix string format "YYYY-MM-DD HH:mm:ss" to "YYYY-MM-DDTHH:mm:ss" for Safari / Mobile compatibility
    let safeDateString = createdAt;
    if (typeof safeDateString === 'string' && safeDateString.includes(' ')) {
      safeDateString = safeDateString.replace(' ', 'T');
    }

    const createdDate = new Date(safeDateString);
    if (isNaN(createdDate.getTime())) return false; // Invalid date

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return createdDate > oneWeekAgo;
  }

  formatPrice(price: any) {
    return Number(price || 0).toLocaleString('id-ID');
  }

}
