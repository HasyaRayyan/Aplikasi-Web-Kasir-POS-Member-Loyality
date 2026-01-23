  import { Component } from '@angular/core';
  import { CapacitorHttp } from '@capacitor/core';
  import { Device } from '@capacitor/device';
  import { Router } from '@angular/router';
  import { StorageService } from '../storage.service';
  import { AlertController } from '@ionic/angular';
  import { App } from '@capacitor/app';
  import { Platform } from '@ionic/angular';
  import { SecureStorageService } from '../services/secure-storage.service';
  import { environment } from '../../environments/environment';
  import { HttpClient } from '@angular/common/http';

  @Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
    standalone: false,
  })
  export class LoginPage {
    outlet_code: string = '';
    username: string = '';
    password: string = '';
    store_code: string = '';
    fullName: string = '';
    email: string = '';
    rememberMe: boolean = false;
    registerPassword: string = '';
    deviceToken: string = '';
    showRegisterPassword: boolean = false;
    showPassword: boolean = false;
    showRegisterForm: boolean = false;
    currentVersion: string = '';
    isVersionValid: boolean = false;
    appVersion: string = '1.0';
    constructor(
      private router: Router,
      private storageService: StorageService,
      private alertController: AlertController,
      private platform: Platform,
      private secureStorage: SecureStorageService,
    ) {
      this.getDeviceToken();


    }

    async ngOnInit() {
    await this.platform.ready();
    await this.secureStorage.init();

    this.outlet_code = (await this.secureStorage.get('outlet_code')) ?? '';
    this.username = (await this.secureStorage.get('username')) ?? '';
    this.rememberMe = !!this.username;

    try {
      const storedPassword = await this.secureStorage.get('password');
      if (storedPassword) {
        this.password = storedPassword;
        this.showPassword = false;
        this.rememberMe = true;
      }
    } catch (e) {
      console.warn('Failed to restore password', e);
    }

    const persistent = await this.secureStorage.get('persistentToken');
    if (persistent) {
      try {
        const resp: any = await CapacitorHttp.post({
          url: 'https://epos.pringapus.com/api/v1/Authentication/validateToken',
          headers: { 'Content-Type': 'application/json' },
          data: { persistentToken: persistent }
        });

        if (resp && resp.status === 200 && resp.data && resp.data.status) {
          // server mengembalikan userData
          localStorage.setItem('user_data', JSON.stringify(resp.data.data.userData));
          // optional: server dapat mengirim access token too
          if (resp.data.data.accessToken) {
            localStorage.setItem('access_token', resp.data.data.accessToken);
          }
          // redirect ke home
          await this.router.navigate(['/tab/home']);
          return;
        } else {
          // token invalid -> hapus
          await this.secureStorage.remove('persistentToken');
        }
      } catch (err) {
        console.warn('validateToken error (non-blocking):', err);
      }
    }
  }
   login() {
    if (!this.outlet_code || !this.username || !this.password) {
      alert('Lengkapi semua field');
      return;
    }

    const body = {
      outlet_code: this.outlet_code,
      username: this.username,
      password: this.password
    };

    this.http.post(environment.apiUrl + 'login', body)
      .subscribe({
        next: (res: any) => {
          if (res.status) {

            // simpan login
            if (this.rememberMe) {
              localStorage.setItem('user', JSON.stringify(res.data.user));
              localStorage.setItem('store', JSON.stringify(res.data.store));
            } else {
              sessionStorage.setItem('user', JSON.stringify(res.data.user));
              sessionStorage.setItem('store', JSON.stringify(res.data.store));
            }

            // redirect dashboard
            this.router.navigate(['/dashboard']);

          } else {
            alert(res.message);
          }
        },
        error: (err) => {
          console.error(err);
          alert('Gagal login, cek koneksi');
        }
      });
  }

  // reset() {
  //   alert('Fitur reset password belum tersedia');
  // }

// setelah login sukses
async afterSuccessfulLogin(responseData: any) {
  // responseData harus berisi userData dan persistentToken (jika remember)
  localStorage.setItem('user_data', JSON.stringify(responseData.userData));
  // simpan persistent token hanya jika server mengirimkannya
  if (responseData.persistentToken) {
    await this.secureStorage.set('persistentToken', responseData.persistentToken);
  } else {
    await this.secureStorage.remove('persistentToken');
  }

  // jika Anda juga ingin mengisi outlet_code & username ke form ketika remember:
  if (this.rememberMe) {
    await this.secureStorage.set('outlet_code', this.outlet_code);
    await this.secureStorage.set('username', this.username);
  } else {
    await this.secureStorage.remove('outlet_code');
    await this.secureStorage.remove('username');
  }

  this.router.navigate(['/tab/home']);
}
  
 async showUpdateAlert() {
    const alert = await this.alertController.create({
      header: 'Update Required',
      message: 'Versi terbaru tersedia. Silakan perbarui aplikasi Anda.',
      buttons: [
        {
          text: 'Update Sekarang',
          handler: () => {
            window.open('https://play.google.com/store/apps/details?id=your.package.name', '_system');
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }

    async presentAlert(header: string, message: string) {
      const alert = await this.alertController.create({
        header: header,
        message: message,
        buttons: ['OK']
      });

      await alert.present();
    }


    async getDeviceToken() {
      const info = await Device.getId();
      this.deviceToken = info.identifier;
    }
    async getLatestVersion(): Promise<string | null> {
      try {
        const response: any = await CapacitorHttp.get({
          url: 'https://epos.pringapus.com/api/v1/Version/get_version',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 200 && response.data.status) {
          return response.data.version.trim(); // Pastikan tidak ada spasi ekstra
        }
        return null;
      } catch (error) {
        console.error('Gagal mendapatkan versi aplikasi:', error);
        return null;
      }
    }

    async forceLogout(deviceToken: string) {
      try {
        await CapacitorHttp.post({
          url: 'https://epos.pringapus.com/api/v1/Authentication/forceLogout',
          data: { device_token: deviceToken },
          headers: { 'Content-Type': 'application/json' },
        });

        localStorage.clear();
        this.router.navigate(['/login']);
      } catch (error) {
        console.error('Gagal logout perangkat lama:', error);
      }
    }

    ionViewWillEnter() {
      // setInterval(async () => {
      //   const currentDeviceToken = localStorage.getItem('device_token');
      //   const response = await CapacitorHttp.post({
      //     url: 'https://epos.pringapus.com/api/v1/Authentication/checkDeviceToken',
      //     data: { device_token: currentDeviceToken },
      //     headers: { 'Content-Type': 'application/json' },
      //   });

      //   if (!response.data.valid) {
      //     this.presentAlert('Sesi Berakhir', 'Silahkan login kembali.');
      //     localStorage.clear();
      //     this.router.navigate(['/login']);
      //   }
      // }, 5000);
    }

    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    }

    toggleRegisterPasswordVisibility() {
      this.showRegisterPassword = !this.showRegisterPassword;
    }
    // Fungsi untuk membuka form registrasi
    openRegisterForm() {
      this.showRegisterForm = true;
    }

    // Fungsi untuk menutup form registrasi
    closeRegisterForm() {
      this.showRegisterForm = false;
    }

    // Fungsi untuk menangani pendaftaran user
    register() {
      // Logic untuk registrasi user
      console.log('User registered:', this.fullName, this.email, this.registerPassword);
      this.router.navigate(['register']);
    }

    reset() {
      this.router.navigate(['forgot']);
    }

    // Fungsi lainnya tetap sama
  }
