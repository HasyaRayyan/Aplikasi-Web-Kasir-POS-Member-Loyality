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
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    const role = Number(user.role_id);
    return isNaN(role) ? null : role;
  } catch {
    return null;
  }
}



  /* ================= TAMBAHAN ================= */

  getUsername(): string {
    return this.getUser()?.username || 'User';
  }

  getRoleName(): string {
    const roleId = this.getRole();
    if (roleId === 1) return 'Admin';
    if (roleId === 2) return 'Kasir';
    return 'User';
  }

  getBasePath(): string {
    const roleId = this.getRole();
    return roleId === 1 ? 'admin' : 'kasir';
  }

  logout() {
    localStorage.removeItem('user');
  }
}
