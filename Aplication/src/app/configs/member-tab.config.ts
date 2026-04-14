export interface MemberTab {
  label: string;
  path: string;
  icon: string;
}

export const MEMBER_TABS: MemberTab[] = [
  {
    label: 'Home',
    path: 'home',
    icon: 'home-outline',
  },
  {
    label: 'Riwayat',
    path: 'riwayat',
    icon: 'time-outline',
  },
  {
    label: 'Profil',
    path: 'profile',
    icon: 'person-outline',
  },
];
