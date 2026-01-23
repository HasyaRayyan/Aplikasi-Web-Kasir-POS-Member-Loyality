import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditMembershipPageRoutingModule } from './edit-membership-routing.module';

import { EditMembershipPage } from './edit-membership.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditMembershipPageRoutingModule
  ],
  declarations: [EditMembershipPage]
})
export class EditMembershipPageModule {}
