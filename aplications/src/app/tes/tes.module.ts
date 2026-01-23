import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TesPageRoutingModule } from './tes-routing.module';

import { TesPage } from './tes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TesPageRoutingModule,
    TesPage   // ← masukkan di imports, bukan declarations
  ],
  declarations: []
})

export class TesPageModule {}
