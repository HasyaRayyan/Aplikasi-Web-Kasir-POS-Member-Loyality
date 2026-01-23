import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TesPage } from './tes.page';

const routes: Routes = [
  {
    path: '',
    component: TesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TesPageRoutingModule {}
