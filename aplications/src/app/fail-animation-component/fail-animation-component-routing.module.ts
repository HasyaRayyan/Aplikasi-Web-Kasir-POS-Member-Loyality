import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FailAnimationComponentPage } from './fail-animation-component.page';

const routes: Routes = [
  {
    path: '',
    component: FailAnimationComponentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FailAnimationComponentPageRoutingModule {}
