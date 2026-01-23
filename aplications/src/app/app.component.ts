import { Component } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { SecureStorageService } from './services/secure-storage.service';
import { Platform } from '@ionic/angular';
import { CapacitorHttp } from '@capacitor/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private router: Router, private platform: Platform, private secureStorage: SecureStorageService) {
    this.showSplash();
    this.initializeApp();
  }
  
  async initializeApp() {
    await this.platform.ready();
    await this.secureStorage.init();
    const persistent = await this.secureStorage.get('persistentToken');

    if (persistent) {
      try {
        const resp: any = await CapacitorHttp.post({
          url: 'https://epos.pringapus.com/api/v1/Authentication/validateToken',
          headers: { 'Content-Type': 'application/json' },
          data: { persistentToken: persistent }
        });

        if (resp && resp.status === 200 && resp.data && resp.data.status) {
          localStorage.setItem('user_data', JSON.stringify(resp.data.data.userData));
          if (resp.data.data.accessToken) {
            localStorage.setItem('access_token', resp.data.data.accessToken);
          }
          await this.router.navigate(['/tab/home']);
          return;
        } 
      } catch (err) {
        console.warn('validateToken error', err);
      }

      // token invalid → hapus + redirect login
      await this.secureStorage.remove('persistentToken');
      await this.router.navigate(['/login']);
      return;
    }

    // tidak ada persistent token → ke login
    await this.router.navigate(['/login']);
  }

  async showSplash(){
    await SplashScreen.show({
      autoHide: true,
      showDuration: 300
    });
  }
}
