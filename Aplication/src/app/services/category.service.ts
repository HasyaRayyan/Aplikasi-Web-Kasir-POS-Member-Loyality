import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private baseUrl = environment.apiBaseUrl + '/api/categories';

  constructor(private http: HttpClient) {}

  // ================= GET ALL =================
  getCategories(page = 1, limit = 10, search = ''): Observable<any> {
    return this.http.get(`${this.baseUrl}?page=${page}&limit=${limit}&search=${search}`);
  }

  // ================= GET BY ID =================
  getCategory(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  // ================= CREATE =================
  createCategory(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  // ================= UPDATE =================
  updateCategory(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  // ================= DELETE =================
  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
