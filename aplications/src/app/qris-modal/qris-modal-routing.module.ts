import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QrisModalPage } from './qris-modal.page';

const routes: Routes = [
  {
    path: '',
    component: QrisModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QrisModalPageRoutingModule {}
