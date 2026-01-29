import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

  getUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  getRole(): number | null {
    const user = this.getUser();
    return user ? Number(user.role_id) : null;
  }

  logout() {
    localStorage.removeItem('user');
  }
}
