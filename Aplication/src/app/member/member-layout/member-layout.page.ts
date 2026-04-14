import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MEMBER_TABS, MemberTab } from '../../configs/member-tab.config';

@Component({
  selector: 'app-member-layout',
  standalone: true,
  templateUrl: './member-layout.page.html',
  styleUrls: ['./member-layout.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule],
})
export class MemberLayoutPage {
  tabs: MemberTab[] = MEMBER_TABS;
}
