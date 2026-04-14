import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class PointService {

  private base = environment.apiBaseUrl + '/api/point-rules';

  constructor(private http: HttpClient) {}

  // ===== GET LIST =====
  getRules(page = 1, search = '') {
    return this.http.get<any>(
      `${this.base}?page=${page}&search=${search}`
    );
  }

  // ===== GET DETAIL =====
  getRule(id: number) {
    return this.http.get<any>(`${this.base}/${id}`);
  }

  // ===== CREATE =====
  createRule(data: any) {
    return this.http.post(this.base, data);
  }

  // ===== UPDATE =====
  updateRule(id: number, data: any) {
    return this.http.put(`${this.base}/${id}`, data);
  }

  // ===== DELETE =====
  deleteRule(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
