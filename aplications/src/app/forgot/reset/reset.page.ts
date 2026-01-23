import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CapacitorHttp } from '@capacitor/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.page.html',
  styleUrls: ['./reset.page.scss'],
  standalone: false,
})
export class ResetPage implements OnInit {
password = '';
  confirm = '';
  error = '';

  userId: string | null = null;
  resetToken: string | null = null;

  private BASE = 'https://epos.pringapus.com/api/v1';

  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    const navState = history.state || {};
    this.userId = navState.user_id ?? sessionStorage.getItem('resetUserId');
    this.resetToken = navState.resetToken ?? sessionStorage.getItem('resetToken');

    if (!this.userId && !this.resetToken) {
      this.presentAlert('Tidak ada data', 'Token reset tidak ditemukan. Silakan ulangi proses lupa kata sandi.');
      this.router.navigate(['forgot']);
    }
  }

  private async presentAlert(title: string, message: string) {
    const a = await this.alertCtrl.create({ header: title, message, buttons: ['OK'] });
    await a.present();
  }

  private async presentToast(message: string, color: 'success'|'warning'|'danger'='success') {
    const t = await this.toastCtrl.create({ message, duration: 2500, color });
    await t.present();
  }

  async submit() {
    this.error = '';
    if (!this.password || this.password.length < 6) {
      this.error = 'Password minimal 6 karakter.';
      return;
    }
    if (this.password !== this.confirm) {
      this.error = 'Password dan konfirmasi tidak cocok.';
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Menyimpan kata sandi baru...' });
    await loading.present();

    try {
      const url = `${this.BASE}/Authentication/resetPassword`;
      let payload: any;
      if (this.resetToken) {
        payload = { reset_token: this.resetToken, password: this.password };
      } else if (this.userId) {
        payload = { user_id: this.userId, password: this.password }; // fallback, kurang aman
      } else {
        throw new Error('Missing reset data');
      }

      const response: any = await CapacitorHttp.post({
        url,
        headers: { 'Content-Type': 'application/json' },
        data: payload,
      });

      const resData = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
      await loading.dismiss();

      if (response.status === 200 && resData && resData.status === true) {
        sessionStorage.removeItem('resetToken');
        sessionStorage.removeItem('resetUserId');

        await this.presentToast('Password berhasil diubah. Silakan login.', 'success');
        this.router.navigate(['login']);
      } else {
        const msg = resData?.message || 'Gagal mengubah password.';
        await this.presentAlert('Gagal', msg);
      }
    } catch (err: any) {
      await this.loadingCtrl.dismiss();
      console.error('resetPassword error', err);
      await this.presentAlert('Error', 'Gagal mengubah password.');
    }
  }
}
