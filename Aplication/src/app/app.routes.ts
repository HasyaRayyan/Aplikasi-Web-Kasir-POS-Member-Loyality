import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { RoleGuard } from './guards/role-guard';

export const routes: Routes = [

  /* ================= LOGIN ================= */
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage),
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  /* ================= ADMIN ================= */
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [1] },
    loadComponent: () =>
      import('./component/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),

    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

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
        path: 'transaksi',
        loadComponent: () =>
          import('./admin/transaksi/transaksi.page')
            .then(m => m.AdminTransaksiPage),


      },
      {
        path: 'category',
        loadComponent: () => 
          import('./admin/category/category.page')
            .then( m => m.CategoryPage)
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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./kasir/dashboard/dashboard.page')
            .then(m => m.KasirDashboardPage),
      },
      {
        path: 'kasir',
        loadComponent: () =>
          import('./kasir/kasir/kasir.page')
            .then(m => m.KasirPage),
      },
      {
        path: 'riwayat',
        loadComponent: () =>
          import('./kasir/riwayat/riwayat.page')
            .then(m => m.RiwayatPage),
      },

    ],
  },

  /* ================= MEMBER ================= */
{
  path: 'member',
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: [3] },
  loadComponent: () =>
    import('./member/member-layout/member-layout.page')
      .then(m => m.MemberLayoutPage),

  children: [
    { path: '', redirectTo: 'home', pathMatch: 'full' },

    {
      path: 'home',
      loadComponent: () =>
        import('./member/home/home.page').then(m => m.HomePage),
    },
    {
      path: 'riwayat',
      loadComponent: () =>
        import('./member/riwayat/riwayat.page').then(m => m.RiwayatPage),
    },
    {
      path: 'profile',
      loadComponent: () =>
        import('./member/profile/profile.page').then(m => m.ProfilePage),
    },
    {
      path: 'redeem-point',
      loadComponent: () =>
        import('./member/redeem-point/redeem-point.page').then(m => m.RedeemPointPage),
    },
    {
      path: 'pesanan-saya',
      loadComponent: () =>
        import('./member/pesanan-saya/pesanan-saya.page').then(m => m.PesananSayaPage),
    },
    {
      path: 'catalog-produk',
      loadComponent: () =>
        import('./member/catalog-produk/catalog-produk.page').then(m => m.CatalogProdukPage),
    },
    {
      path: 'poin-saya',
      loadComponent: () =>
        import('./member/poin-saya/poin-saya.page').then(m => m.PoinSayaPage),
    },
  ],
}
,

  /* ================= LOGOUT ================= */
  {
    path: 'logout',
    loadComponent: () =>
      import('./pages/logout/logout.page').then(m => m.LogoutPage),
  },

  /* ================= FALLBACK ================= */
  {
    path: '**',
    redirectTo: 'login',
  },

  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage)
  },


];
