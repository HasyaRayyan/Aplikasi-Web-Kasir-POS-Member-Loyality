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
export class AddonService {

  api = 'http://localhost:8080/api/addons';

  constructor(private http: HttpClient) {}

  getAddons(page = 1, limit = 10, search = '') {
    return this.http.get<any>(
      `${this.api}?page=${page}&limit=${limit}&search=${search}`
    );
  }

  createAddon(data: any) {
    return this.http.post(this.api, data);
  }

  updateAddon(id: number, data: any) {
    return this.http.post(`${this.api}/update/${id}`, data);
  }

  deleteAddon(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
