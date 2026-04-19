import { Component } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, home, gridOutline, grid, starOutline, star, bagHandleOutline, bagHandle, personOutline, person } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MEMBER_TABS, MemberTab } from '../../configs/member-tab.config';

@Component({
  selector: 'app-member-layout',
  standalone: true,
  templateUrl: './member-layout.page.html',
  styleUrls: ['./member-layout.page.scss'],
  imports: [CommonModule, IonContent, IonIcon, RouterModule],
})
export class MemberLayoutPage {
  tabs: MemberTab[] = MEMBER_TABS;

  constructor() {
    addIcons({ 
      'home-outline': homeOutline, 
      'home': home, 
      'grid-outline': gridOutline, 
      'grid': grid, 
      'star-outline': starOutline, 
      'star': star, 
      'bag-handle-outline': bagHandleOutline, 
      'bag-handle': bagHandle, 
      'person-outline': personOutline, 
      'person': person 
    });
  }
}
