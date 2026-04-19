import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface Product {
  id: number;
  product_code: string;
  product_name: string;
  category_id: number;
  category_name: string;
  image: string | null;
  price: string;
  point_price: number;
  qty: string;
  is_active: string;
  is_exchangeable: string | number;
  addons: any[];
}


@Injectable({ providedIn: 'root' })
export class ProductService {

  constructor(private http: HttpClient) {}

getProducts(page = 1, limit = 10, search = '', categoryId = '') {
  return this.http.get<any>(
    `${environment.apiBaseUrl}/api/products?page=${page}&limit=${limit}&search=${search}&category_id=${categoryId}`
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

getKasir(search='', category='', page=1, limit=9){
  return this.http.get<any>(
    `${environment.apiBaseUrl}/api/kasir?search=${search}&category=${category}&page=${page}&limit=${limit}`
  );
}


}
