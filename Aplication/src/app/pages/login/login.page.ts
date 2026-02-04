import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
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
    private router: Router
  ) {}

login() {
  if (!this.username || !this.password) {
    alert('Username dan password wajib diisi');
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
        alert(res.message);
        return;
      }

      const user = res.data;
      // localStorage.clear()

      localStorage.setItem('user', JSON.stringify(user));

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
      alert('Login gagal');
    }
  });
}


}
