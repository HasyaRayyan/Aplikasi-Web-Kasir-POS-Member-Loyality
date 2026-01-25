import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
})
export class LoginPage {
  outlet_code = '';
  username = '';
  password = '';

  constructor(
    private http: HttpClient, // 🔥 HARUS BERHASIL DI-INJECT
    private router: Router
  ) {}

  login() {
    console.log('LOGIN PAGE WORKS');
  }
}
