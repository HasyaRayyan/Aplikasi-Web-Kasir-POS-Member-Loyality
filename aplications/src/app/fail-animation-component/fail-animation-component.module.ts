import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FailAnimationComponentPageRoutingModule } from './fail-animation-component-routing.module';

import { FailAnimationComponentPage } from './fail-animation-component.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FailAnimationComponentPageRoutingModule
  ],
  declarations: [FailAnimationComponentPage]
})
export class FailAnimationComponentPageModule {}
