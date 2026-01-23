import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SetPassPageRoutingModule } from './set-pass-routing.module';

import { SetPassPage } from './set-pass.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SetPassPageRoutingModule
  ],
  declarations: [SetPassPage]
})
export class SetPassPageModule {}
