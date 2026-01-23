  import { NgModule } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';

  import { IonicModule } from '@ionic/angular';

  import { KeranjangPageRoutingModule } from './keranjang-routing.module';


  @NgModule({
    imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      KeranjangPageRoutingModule
    ],
  })
  export class KeranjangPageModule {}
