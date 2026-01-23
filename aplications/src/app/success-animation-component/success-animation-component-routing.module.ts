import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SuccessAnimationComponentPage } from './success-animation-component.page';

const routes: Routes = [
  {
    path: '',
    component: SuccessAnimationComponentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuccessAnimationComponentPageRoutingModule {}
