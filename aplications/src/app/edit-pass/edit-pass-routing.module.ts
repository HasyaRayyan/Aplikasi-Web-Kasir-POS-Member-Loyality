import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditPassPage } from './edit-pass.page';

const routes: Routes = [
  {
    path: '',
    component: EditPassPage
  },
  {
    path: 'otp',
    loadChildren: () => import('./otp/otp.module').then( m => m.OtpPageModule)
  },
  {
    path: 'set-pass',
    loadChildren: () => import('./set-pass/set-pass.module').then( m => m.SetPassPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditPassPageRoutingModule {}
