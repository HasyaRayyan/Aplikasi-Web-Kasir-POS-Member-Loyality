import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const role = this.auth.getRole();
    const allowedRoles: number[] = route.data['roles'] ?? [];

    if (role && allowedRoles.includes(role)) {
      return true;
    }

    return this.router.createUrlTree(['/login']);
  }
}
