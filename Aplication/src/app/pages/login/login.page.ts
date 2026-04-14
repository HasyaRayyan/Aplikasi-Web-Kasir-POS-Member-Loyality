import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
  ],
})
export class LoginPage {

  username: string = '';
  password: string = '';
  loading: boolean = false;

  private apiUrl = `${environment.apiBaseUrl}/auth/login`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async showToast(msg: string, color: string = 'danger') {
    const t = await this.toastCtrl.create({
      message: msg, duration: 2500, color: color, position: 'top', mode: 'ios'
    });
    t.present();
  }

login() {
  if (!this.username || !this.password) {
    this.showToast('Gagal! Username dan password wajib diisi', 'warning');
    return;
  }

  this.loading = true;

  this.http.post<any>(this.apiUrl, {
    username: this.username,
    password: this.password,
  }).subscribe({
    next: (res) => {
      this.loading = false;

      if (!res.success) {
        this.showToast(res.message);
        return;
      }
      const user = res.data;

      // simpan full object (optional)
      localStorage.setItem('user', JSON.stringify(user));

      // WAJIB INI
      localStorage.setItem('user_id', user.id);
      localStorage.setItem('user_name', user.name);
      localStorage.setItem('role_id', user.role_id);


      // ⬇️ REDIRECT ROLE
      if (Number(user.role_id) === 1) {
        this.router.navigate(['/admin/dashboard']);

      } else if (Number(user.role_id) === 2) {
        this.router.navigate(['/kasir/dashboard']);

      } else if (Number(user.role_id) === 3) {
        this.router.navigate(['/member/home']);
      }


    },
    
    error: () => {
      this.loading = false;
      this.showToast('Gagal terhubung ke server! Cek jaringan Anda.');
    }
  });
}


}
