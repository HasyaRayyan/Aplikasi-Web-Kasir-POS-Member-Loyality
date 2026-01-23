import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPage } from './login.page'; // Impor LoginPage

const routes: Routes = [
  {
    path: '',
    component: LoginPage, // Gunakan langsung LoginPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginPageRoutingModule {}
