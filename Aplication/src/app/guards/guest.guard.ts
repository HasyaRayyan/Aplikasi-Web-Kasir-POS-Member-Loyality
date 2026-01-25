import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  // ⚠️ JANGAN redirect kalau di route root
  if (token && token !== 'undefined' && token !== 'null') {
    router.navigateByUrl('/home');
    return false;
  }

  return true; // ⬅️ INI KUNCI BIAR LOGIN TAMPIL
};
