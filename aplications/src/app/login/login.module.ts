import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoginPage } from './login.page';
import { LoginPageRoutingModule } from './login-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,  // Pastikan FormsModule ada
    IonicModule,
    LoginPageRoutingModule,
  ],
  declarations: [LoginPage],  // Deklarasikan LoginPage di sini
})
export class LoginPageModule {}
