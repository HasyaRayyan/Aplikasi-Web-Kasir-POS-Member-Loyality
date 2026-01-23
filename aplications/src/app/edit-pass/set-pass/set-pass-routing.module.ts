import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetPassPage } from './set-pass.page';

const routes: Routes = [
  {
    path: '',
    component: SetPassPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetPassPageRoutingModule {}
