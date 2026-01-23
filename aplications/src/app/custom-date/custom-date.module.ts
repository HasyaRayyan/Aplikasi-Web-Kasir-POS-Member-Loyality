import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomDatePageRoutingModule } from './custom-date-routing.module';

import { CustomDatePage } from './custom-date.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomDatePageRoutingModule
  ],
  declarations: [CustomDatePage]
})
export class CustomDatePageModule {}
