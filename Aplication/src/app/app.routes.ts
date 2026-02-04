import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { RoleGuard } from './guards/role-guard';

export const routes: Routes = [

  /* ================= LOGIN ================= */
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page')
        .then(m => m.LoginPage),
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  /* ================= ADMIN (PAKAI MAIN LAYOUT) ================= */
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [1] },

    // ⬇️ INI KUNCI UTAMANYA
    loadComponent: () =>
      import('./component/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),

    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/dashboard/dashboard.page')
            .then(m => m.AdminDashboard),
      },
      {
        path: 'produk',
        loadComponent: () =>
          import('./admin/produk/produk.page')
            .then(m => m.ProdukPage),
      },
      {
        path: 'point',
        loadComponent: () =>
          import('./admin/point/point.page')
            .then(m => m.PointPage),
      },
      {
        path: 'member',
        loadComponent: () =>
          import('./admin/member/member.page')
            .then(m => m.MemberPage),
      },
        {
    path: 'addon',
    loadComponent: () => import('./admin/addon/addon.page').then( m => m.AddonPage)
  },
    ],
  },

  /* ================= KASIR ================= */
{
  path: 'kasir',
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: [2] },
  loadComponent: () =>
    import('./component/main-layout/main-layout.component')
      .then(m => m.MainLayoutComponent),

  children: [
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    },
    {
      path: 'dashboard',
      loadComponent: () =>
        import('./kasir/dashboard/dashboard.page')
          .then(m => m.KasirDashboardPage),
    },
    {
      path: 'transaksi',
      loadComponent: () =>
        import('./kasir/kasir/kasir.page')
          .then(m => m.KasirPage),
    },
    {
      path: 'kasir',
      loadComponent: () =>
        import('./kasir/kasir/kasir.page')
          .then(m => m.KasirPage),
    }
  ],
},


{
  path: 'member',
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: [3] },
  children: [
    {
      path: '',
      redirectTo: 'home',
      pathMatch: 'full',
    },
    {
      path: 'home',
      loadComponent: () =>
        import('./member/home/home.page')
          .then(m => m.HomePage),
    },
  ],
},
  {
    path: 'riwayat',
    loadComponent: () => import('./kasir/riwayat/riwayat.page').then( m => m.RiwayatPage)
  }




];
