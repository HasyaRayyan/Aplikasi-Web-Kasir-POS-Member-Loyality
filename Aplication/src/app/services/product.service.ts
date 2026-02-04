import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface Product {
  id: number;
  product_code: string;
  product_name: string;
  category_id: number;
  category_name: string; // ⬅️ WAJIB
  image: string | null;
  price: string;
  qty: string;
  is_active: string;
  addons: any[];
}


@Injectable({ providedIn: 'root' })
export class ProductService {

  constructor(private http: HttpClient) {}

getProducts(page = 1, limit = 10, search = '') {
  return this.http.get<any>(
    `${environment.apiBaseUrl}/api/products?page=${page}&limit=${limit}&search=${search}`
  );
}

getAddons(page = 1, limit = 10, search = '') {
  return this.http.get<any>(
    `${environment.apiBaseUrl}/api/addons?page=${page}&limit=${limit}&search=${search}`
  );
}


createProduct(data: any) {
  return this.http.post(`${environment.apiBaseUrl}/api/products`, data);
}


getCategories() {
  return this.http.get<any>(`${environment.apiBaseUrl}/api/categories`);
}

deleteProduct(id: string | number) {
    return this.http.delete(`${environment.apiBaseUrl}/api/products/${id}`);
}
 
getGenerateCode() {
  return this.http.get<any>(`${environment.apiBaseUrl}/api/generate-product-code`);
}

updateProduct(id: number | null, data: FormData) {
  return this.http.post(`${environment.apiBaseUrl}/api/updateproduct/${id}`, data);
}

}
