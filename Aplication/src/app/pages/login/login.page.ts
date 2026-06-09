import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { HomeService } from 'src/app/services/home.service';
import { addIcons } from 'ionicons';
import { arrowBack, personOutline, lockClosedOutline } from 'ionicons/icons';

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
    RouterLink,
  ],
})
export class LoginPage {

  username: string = '';
  password: string = '';
  loading: boolean = false;

  /* RESET PASSWORD */
  showResetModal = false;
  resetStep = 1;
  resetPhone = '';
  otpCode = '';
  newPassword = '';
  confirmPassword = '';
  resetLoading = false;

  private apiUrl = `${environment.apiBaseUrl}/api/auth/login`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastCtrl: ToastController,
    private homeService: HomeService
  ) {
    addIcons({ arrowBack, personOutline, lockClosedOutline });
  }

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
    
    error: (err) => {
      this.loading = false;
      console.error('Login Error:', err);
      
      let msg = 'Gagal terhubung ke server! Cek jaringan Anda.';
      
      if (err.status === 401) {
        msg = err.error?.message || 'Password salah';
      } else if (err.status === 404) {
        msg = err.error?.message || 'User tidak ditemukan';
      } else if (err.error?.message) {
        msg = err.error.message;
      }
      
      this.showToast(msg);
    }
  });
}

/* ================= RESET PASSWORD FLOW ================= */

openResetModal() {
  this.resetStep = 1;
  this.showResetModal = true;
}

requestResetOTP() {
  if (!this.resetPhone) {
    this.showToast('Masukkan nomor HP', 'warning');
    return;
  }
  this.resetLoading = true;
    this.homeService.requestResetOTP(this.resetPhone).subscribe({
      next: (res: any) => {
        this.resetLoading = false;
        if (res.success) {
          this.showToast(res.message, 'success');
          this.resetStep = 2;
        } else {
          this.showToast(res.message);
        }
      },
      error: (err: any) => {
        this.resetLoading = false;
        this.showToast(err.error?.message || 'Gagal mengirim OTP');
      }
    });
}

verifyResetOTP() {
  if (!this.otpCode || this.otpCode.length < 6) {
    this.showToast('Masukkan 6 digit kode OTP', 'warning');
    return;
  }
  this.resetStep = 3;
}

confirmReset() {
  if (!this.newPassword || this.newPassword !== this.confirmPassword) {
    this.showToast('Password tidak cocok', 'warning');
    return;
  }
  this.resetLoading = true;
  this.homeService.commitResetPassword({
    phone: this.resetPhone,
    otp: this.otpCode,
    password: this.newPassword
  }).subscribe({
    next: (res: any) => {
      this.resetLoading = false;
      if (res.success) {
        this.showToast(res.message, 'success');
        this.showResetModal = false;
      } else {
        this.showToast(res.message);
      }
    },
    error: (err: any) => {
      this.resetLoading = false;
      this.showToast(err.error?.message || 'Gagal atur ulang kata sandi');
    }
  });
}


}
