import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonIcon, 
  IonButton, IonList, IonListHeader, IonLabel, IonItem, 
  IonMenu, IonMenuToggle 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  gridOutline, cubeOutline, starOutline, peopleOutline, 
  listOutline, receiptOutline, cashOutline, logOutOutline, 
  chevronForwardOutline 
} from 'ionicons/icons';
import { MenuController } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { MENU, MenuGroup } from '../configs/menu.config';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    IonContent, IonHeader, IonToolbar, IonTitle, IonIcon, 
    IonButton, IonList, IonListHeader, IonLabel, IonItem, 
    IonMenu, IonMenuToggle,
    RouterModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  menu: MenuGroup[] = [];

  roleId: number | null = null;
  username = '';
  roleName = '';
  basePath = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private menuCtrl: MenuController
  ) {
    addIcons({ 
      'grid-outline': gridOutline, 
      'cube-outline': cubeOutline, 
      'star-outline': starOutline, 
      'people-outline': peopleOutline, 
      'list-outline': listOutline, 
      'receipt-outline': receiptOutline, 
      'cash-outline': cashOutline, 
      'log-out-outline': logOutOutline, 
      'chevron-forward-outline': chevronForwardOutline 
    });
  }

  ngOnInit() {
    this.roleId = this.authService.getRole();
    if (this.roleId === null) return;

    this.username = this.authService.getUsername();
    this.roleName = this.authService.getRoleName();
    this.basePath = this.authService.getBasePath();

    this.menu = this.getMenuByRole(this.roleId);
  }

  logout() {
    this.loading = true;


    setTimeout(() => {
      this.loading = false;
      this.authService.logout();
      location.href = '/login';
  }, 800);
  }

  getMenuByRole(roleId: number): MenuGroup[] {
    return MENU
      .map(group => {
        if (group.roles && !group.roles.includes(roleId)) return null;

        return {
          ...group,
          items: group.items.filter(
            item => !item.roles || item.roles.includes(roleId)
          ),
        };
      })
      .filter(
        (group): group is MenuGroup =>
          group !== null && group.items.length > 0
      );
  }

  /** ✅ TOGGLE MENU DENGAN CARA BENAR */
  async toggleMenu() {
    const isOpen = await this.menuCtrl.isOpen('start');

    if (isOpen) {
      await this.menuCtrl.close('start');
    } else {
      await this.menuCtrl.open('start');
    }
  }


}
