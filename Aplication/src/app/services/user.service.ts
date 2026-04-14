import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface User {
  id: number;
  role_id: number;
  name: string;
  email: string;
  phone: string;
  username: string;
  created_at: string;

  total_points: number;
  membership_level: 'Basic' | 'Silver' | 'Gold' | 'Platinum';
}

@Injectable({ providedIn: 'root' })
export class UserService {

  private api = environment.apiBaseUrl + '/api/users';

  constructor(private http: HttpClient) {}

  // ===== GET ALL =====
  getUsers(page = 1, limit = 10, search = '') {
    return this.http.get<any>(
      `${this.api}?page=${page}&limit=${limit}&search=${search}`
    );
  }

  // ===== CREATE =====
  createUser(data: any) {
    return this.http.post(this.api, data);
  }

  // ===== UPDATE =====
  updateUser(id: number, data: any) {
    // ⬅️ UBAH KE POST
    return this.http.post(`${this.api}/update/${id}`, data);
  }

  // ===== DELETE =====
  deleteUser(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }

  getRoles() {
    return this.http.get(`${this.api}/roles`);
    }

}
