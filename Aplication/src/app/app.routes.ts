import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { RoleGuard } from './guards/role-guard';

export const routes: Routes = [

  // LOGIN (PUBLIC)
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage),
  },

  // ROOT → AUTO REDIRECT
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },


  // MEMBER
  {
    path: 'member/home',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [3] },
    loadComponent: () =>
      import('./member/home/home.page').then(m => m.HomePage),
  },
  {
  path: 'admin/produk',
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: [1] },
  loadComponent: () =>
    import('./admin/produk/produk.page')
      .then(m => m.ProdukPage),
  },
      {
      path: 'admin/dashboard',
      loadComponent: () =>
        import('./admin/dashboard/dashboard.page')
          .then(m => m.AdminDashboardPage),
    },
        {
      path: 'kasir/dashboard',
      loadComponent: () =>
        import('./kasir/dashboard/dashboard.page')
          .then(m => m.KasirDashboardPage),
    },

  { path: '**', redirectTo: 'login' },
  {
    path: 'kasir',
    loadComponent: () => import('./kasir/kasir/kasir.page').then( m => m.KasirPage)
  }
];
