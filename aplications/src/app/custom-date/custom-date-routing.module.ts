import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomDatePage } from './custom-date.page';

const routes: Routes = [
  {
    path: '',
    component: CustomDatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomDatePageRoutingModule {}
