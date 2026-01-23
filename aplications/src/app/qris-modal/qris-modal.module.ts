import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QrisModalPageRoutingModule } from './qris-modal-routing.module';

import { QrisModalPage } from './qris-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QrisModalPageRoutingModule
  ],
})
export class QrisModalPageModule {}
