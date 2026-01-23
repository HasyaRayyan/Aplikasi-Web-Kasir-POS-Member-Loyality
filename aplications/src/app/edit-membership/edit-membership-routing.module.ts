import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditMembershipPage } from './edit-membership.page';

const routes: Routes = [
  {
    path: '',
    component: EditMembershipPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditMembershipPageRoutingModule {}
