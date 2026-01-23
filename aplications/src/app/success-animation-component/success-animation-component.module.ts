import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SuccessAnimationComponentPageRoutingModule } from './success-animation-component-routing.module';

import { SuccessAnimationComponentPage } from './success-animation-component.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SuccessAnimationComponentPageRoutingModule
  ],
  declarations: [SuccessAnimationComponentPage]
})
export class SuccessAnimationComponentPageModule {}
