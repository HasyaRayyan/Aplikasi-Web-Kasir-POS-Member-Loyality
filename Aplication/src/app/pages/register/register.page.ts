import { Component } from '@angular/core';
import { IonContent, IonIcon, IonInput, IonSpinner, ToastController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonInput, IonSpinner, CommonModule, FormsModule, HttpClientModule, RouterLink]
})
export class RegisterPage {

  loading = false;
  
  // 1: Phone, 2: OTP, 3: Profile Form
  currentStep = 1;

  form: any = {
    phone: '',
    otp: '',
    name: '',
    email: '',
    password: ''
  };

  private apiUrl = `${environment.apiBaseUrl}/api/auth/register`;

  constructor(
    private toastCtrl: ToastController,
    private http: HttpClient,
    private router: Router
  ) {}

  async toast(msg: string, color = 'danger') {
    const t = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'top',
      color,
      mode: 'ios'
    });
    t.present();
  }

  // --- STEP 1 ---
  sendOtp() {
    if (!this.form.phone || this.form.phone.length < 9) {
      this.toast('Nomor telepon tidak valid/terlalu pendek', 'warning');
      return;
    }

    this.loading = true;

    // 1. Cek dulu apakah nomor sudah terdaftar di database
    this.http.post<any>(`${environment.apiBaseUrl}/api/auth/check-phone`, {
      phone: this.form.phone
    }).subscribe({
      next: (res) => {
        
        // 2. Jika tersedia, kirim SMS OTP asli melalui backend
        this.http.post<any>(`${environment.apiBaseUrl}/api/auth/send-otp`, {
          phone: this.form.phone
        }).subscribe({
          next: (otpRes) => {
            this.loading = false;
            this.currentStep = 2;
            
            // Simpan OTP yang di-generate backend untuk verifikasi (simulasi frontend)
            // Di sistem asli, verifikasi biasanya dilakukan di backend juga.
            if (otpRes.simulated_otp) {
               this.generatedOtp = otpRes.simulated_otp.toString();
               this.toast('SMS Berhasil dikirim! Cek HP kamu.', 'success');
            }
          },
          error: (err) => {
            this.loading = false;
            this.toast(err.error?.message || 'Gagal mengirim SMS, coba lagi nanti', 'danger');
          }
        });

      },
      error: (err) => {
        this.loading = false;
        this.toast(err.error?.message || 'Nomor HP sudah terdaftar', 'danger');
      }
    });
  }

  generatedOtp: string = '';

  // --- STEP 2 ---
  verifyOtp() {
    if (this.form.otp.toString() !== this.generatedOtp) {
      this.toast('Kode OTP salah! Periksa kembali SMS kamu.', 'danger');
      return;
    }
    
    // Sukses OTP, lanjut ke Biodata
    this.currentStep = 3;
    this.form.otp = ''; // clear
  }

  // --- STEP 3 ---
  register() {
    if (!this.form.name || !this.form.password) {
      this.toast('Nama dan Password wajib diisi', 'warning');
      return;
    }

    this.loading = true;

    this.http.post<any>(this.apiUrl, {
      phone: this.form.phone,
      name: this.form.name,
      email: this.form.email,
      password: this.form.password,
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.success) {
          this.toast(res.message, 'danger');
          return;
        }

        this.toast('Pendaftaran Member Sukses! Silakan Login.', 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || 'Gagal terhubung ke server';
        this.toast(msg, 'danger');
      }
    });

  }

  goBack() {
    if (this.currentStep > 1) {
      this.currentStep--;
    } else {
      this.router.navigate(['/login']);
    }
  }

}
