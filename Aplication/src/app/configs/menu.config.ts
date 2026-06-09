export interface MenuItem {
  label: string;
  path: string;
  icon: string;
  roles?: number[];
}

export interface MenuGroup {
  title: string;
  roles?: number[];
  items: MenuItem[];
}

export const MENU: MenuGroup[] = [
  {
    title: 'Main Menu',
    roles: [1],
    items: [
      {
        label: 'Dashboard',
        path: 'dashboard',
        icon: 'grid-outline',
      },
      {
        label: 'Produk',
        path: 'produk',
        icon: 'cube-outline',
      },
      {
        label: 'Point',
        path: 'point',
        icon: 'star-outline',
      },
      {
        label: 'Member',
        path: 'member',
        icon: 'people-outline',
      },
      {
        label: 'Category',
        path: 'category',
        icon: 'list-outline',
      },
      {
        label: 'Riwayat Transaksi',
        path: 'transaksi',
        icon: 'receipt-outline',
      },
      {
        label: 'Slider Banner',
        path: 'slider',
        icon: 'image-outline',
      },
    ],
  },
  {
    title: 'KASIR',
    roles: [2],
    items: [
        {
        label: 'Dashbaord',
        path: 'dashboard',
        icon: 'grid-outline',
        roles: [2],
      },
      {
        label: 'Kasir',
        path: 'kasir',
        icon: 'cash-outline',
        roles: [2],
      },
      {
        label: 'Riwayat',
        path: 'riwayat',
        icon: 'receipt-outline',
        roles: [2],
      },
    ],
  },
];
