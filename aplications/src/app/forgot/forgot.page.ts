import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CapacitorHttp } from '@capacitor/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.page.html',
  styleUrls: ['./forgot.page.scss'],
  standalone: false,
})
export class ForgotPage implements OnDestroy {
  username = '';
  error = '';

  // found user/outlet
  initials = '';
  foundData: any = null;

  // stage
  stage: 'input' | 'detail' | 'otp' = 'input';

  // otp digits array
  otpDigits: string[] = ['', '', '', '', '', ''];

  // cooldown/timer
  otpCountdown = 0;
  private otpTimer: any = null;
  otpExpiresIn = 300;
  otpSentTime = 0;
  otpCooldownRemaining = 0;
  otpResendCooldown = 60;

  private BASE = 'https://epos.pringapus.com/api/v1';

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnDestroy() {
    this.clearOtpTimer();
  }

  back() { this.router.navigate(['login']); }

  contactSupport() {
    window.location.href = 'mailto:support@otatea.com';
  }

  private async presentAlert(title: string, message: string) {
    const alert = await this.alertCtrl.create({ header: title, message, buttons: ['OK'] });
    await alert.present();
  }

  private async presentToast(message: string, color: 'success'|'warning'|'danger' = 'success') {
    const t = await this.toastCtrl.create({ message, duration: 2500, color });
    await t.present();
  }

  private computeInitials(nameOrUsername: string): string {
    if (!nameOrUsername) return '';
    const cleaned = nameOrUsername.trim().replace(/\s+/g, ' ');
    const parts = cleaned.split(' ').filter(p => p.length > 0);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  // (optional) normalize phone for API: remove non-digit
  private normalizePhoneForApi(phone: string): string {
    if (!phone) return phone;
    return phone.replace(/\D+/g, '');
    // if DB uses +62 format, convert: if (p.startsWith('0')) return '+62' + p.slice(1);
  }

  // ----------------- STEP 1: check username -----------------
  async checkUsername() {
    this.error = '';
    if (!this.username || this.username.trim().length < 2) {
      this.error = 'Masukkan username yang valid.';
      return;
    }

    const payload = { username: this.username.trim() };
    const url = `${this.BASE}/outlets/verify_username`;

    const loading = await this.loadingCtrl.create({ message: 'Memeriksa username...' });
    await loading.present();

    try {
      const response: any = await CapacitorHttp.post({
        url,
        headers: { 'Content-Type': 'application/json' },
        data: payload
      });

      const resData = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
      await loading.dismiss();

      if (response.status === 200 && resData && resData.success) {
        this.foundData = resData.data;
        this.initials = this.computeInitials(this.foundData.name || this.foundData.username);
        this.stage = 'detail';
        this.presentToast('User ditemukan. Periksa data di bawah, lalu kirim OTP untuk verifikasi.', 'success');
      } else {
        const msg = resData?.message || 'Username tidak ditemukan.';
        this.error = msg;
        await this.presentToast(msg, 'warning');
      }
    } catch (error: any) {
      await this.loadingCtrl.dismiss();
      console.error('checkUsername error', error);
      const msg = error?.message || (error?.data ? (typeof error.data === 'string' ? error.data : error.data.message) : 'Gagal memeriksa username.');
      this.error = msg;
      await this.presentAlert('Error', 'Kesalahan: ' + msg);
    }
  }

  // reset to input
  editUsername() {
    this.foundData = null;
    this.username = '';
    this.error = '';
    this.stage = 'input';
    this.clearOtpTimer();
    this.otpDigits = ['', '', '', '', '', ''];
  }

  // ----------------- STEP 2: request OTP -----------------
  async onSendOtp() {
    if (!this.foundData || !this.foundData.phone) {
      this.error = 'Data user tidak tersedia.';
      return;
    }

    const confirm = await this.alertCtrl.create({
      header: 'Kirim OTP',
      message: `Kami akan mengirim kode verifikasi (OTP) ke nomor ${this.foundData.phone}. Lanjutkan?`,
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Kirim',
          handler: async () => {
            const loading = await this.loadingCtrl.create({ message: 'Mengirim OTP...' });
            await loading.present();

            try {
              const url = `${this.BASE}/Authentication/requestOtp`;
              const normalized = this.normalizePhoneForApi(this.foundData.phone);

              // IMPORTANT: kirim parameter 'bypass' agar backend menemukan settings bypass jika ada
              const payload = { phone: normalized, parameter: 'bypass' };

              console.log('requestOtp payload', payload);
              const response: any = await CapacitorHttp.post({
                url,
                headers: { 'Content-Type': 'application/json' },
                data: payload
              });

              const resData = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
              await loading.dismiss();

              if (response.status === 200 && resData && resData.status === true) {
                // backend boleh mengembalikan expires_in dan/atau info lainnya
                if (resData.data && resData.data.expires_in) {
                  this.otpExpiresIn = resData.data.expires_in;
                } else {
                  this.otpExpiresIn = 300;
                }

                this.otpDigits = ['', '', '', '', '', ''];
                this.stage = 'otp';
                this.otpSentTime = Date.now();
                this.startOtpCountdown(60); // disable resend 60s
                await this.presentToast('OTP berhasil dikirim. Periksa WhatsApp/SMS Anda.', 'success');
              } else {
                const msg = resData?.message || 'Gagal mengirim OTP.';
                await this.presentAlert('Gagal', msg);
              }
            } catch (err: any) {
              await this.loadingCtrl.dismiss();
              console.error('requestOtp error', err);
              const msg = err?.message || 'Terjadi kesalahan saat mengirim OTP.';
              await this.presentAlert('Error', msg);
            }
          }
        }
      ]
    });

    await confirm.present();
  }

  // ----------------- OTP countdown -----------------
  private startOtpCountdown(seconds: number) {
    this.clearOtpTimer();
    this.otpCountdown = seconds;
    this.otpTimer = setInterval(() => {
      this.otpCountdown--;
      if (this.otpCountdown <= 0) this.clearOtpTimer();
    }, 1000);

    // also set resend cooldown tracking
    this.otpCooldownRemaining = seconds;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.otpSentTime) / 1000);
      this.otpCooldownRemaining = Math.max(0, this.otpResendCooldown - elapsed);
      if (this.otpCooldownRemaining <= 0) clearInterval(interval);
    }, 1000);
  }

  private clearOtpTimer() {
    if (this.otpTimer) {
      clearInterval(this.otpTimer);
      this.otpTimer = null;
    }
    this.otpCountdown = 0;
    this.otpCooldownRemaining = 0;
  }

  async resendOtp() {
    if (this.otpCooldownRemaining > 0) return;

    const loading = await this.loadingCtrl.create({ message: 'Mengirim ulang OTP...' });
    await loading.present();

    try {
      const url = `${this.BASE}/Authentication/requestOtp`;
      const normalized = this.normalizePhoneForApi(this.foundData.phone);
      const payload = { phone: normalized, parameter: 'bypass' };

      const response: any = await CapacitorHttp.post({
        url,
        headers: { 'Content-Type': 'application/json' },
        data: payload
      });

      const resData = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
      await loading.dismiss();

      if (response.status === 200 && resData && resData.status === true) {
        this.startOtpCountdown(60);
        this.otpSentTime = Date.now();
        await this.presentToast('OTP terkirim ulang.', 'success');
      } else {
        const msg = resData?.message || 'Gagal mengirim ulang OTP.';
        await this.presentAlert('Gagal', msg);
      }
    } catch (err: any) {
      await this.loadingCtrl.dismiss();
      console.error('resendOtp error', err);
      await this.presentAlert('Error', 'Gagal mengirim ulang OTP.');
    }
  }

  // ----------------- OTP helpers -----------------
  moveToNext(event: any, nextInput?: HTMLInputElement) {
    const value = event.target.value;
    if (value.length === 1 && nextInput) {
      nextInput.focus();
    }
  }

  handleBackspace(event: any, prevInput: HTMLInputElement | null = null, currentInput?: HTMLInputElement) {
    if (event.key === 'Backspace' && currentInput?.value === '' && prevInput) {
      prevInput.focus();
    }
  }

  onOtpComplete() {
    // auto-trigger verify jika user memasukkan semua digit
    const joined = this.otpDigits.join('');
    if (joined.length === 6) {
      this.verifyOtp();
    }
  }

  // ----------------- STEP 3: verify OTP -----------------
  async verifyOtp() {
    this.error = '';
    const otpString = this.otpDigits.join('').trim();
    if (!otpString || otpString.length < 4) {
      this.error = 'Masukkan kode OTP yang valid.';
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Memverifikasi OTP...' });
    await loading.present();

    try {
      const url = `${this.BASE}/Authentication/verifOtp`;
      const payload = { phone: this.normalizePhoneForApi(this.foundData.phone), otp: otpString };

      console.log('verifyOtp payload', payload);
      const response: any = await CapacitorHttp.post({
        url,
        headers: { 'Content-Type': 'application/json' },
        data: payload
      });

      const resData = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
      console.log('verifyOtp response', response.status, resData);
      await loading.dismiss();

      if (response.status === 200 && resData && resData.status === true) {
        // ambil reset token jika backend mengembalikan
        const resetToken = resData.data?.reset_token ?? null;

        if (resetToken) sessionStorage.setItem('resetToken', resetToken);
        if (this.foundData.user_id) sessionStorage.setItem('resetUserId', this.foundData.user_id);

        await this.presentToast('OTP valid. Silakan atur kata sandi baru.', 'success');
        this.clearOtpTimer();

        // navigate ke page reset-password (sesuaikan route jika beda)
        this.router.navigate(['forgot/reset'], {
          state: {
            user_id: this.foundData.user_id,
            resetToken
          }
        });
      } else {
        const msg = resData?.message || 'OTP tidak valid atau kadaluarsa.';
        this.error = msg;
        await this.presentToast(msg, 'warning');
      }
    } catch (err: any) {
      await this.loadingCtrl.dismiss();
      console.error('verifyOtp error', err);
      await this.presentAlert('Error', 'Gagal memverifikasi OTP.');
    }
  }
}
