import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { provideLottieOptions } from 'ngx-lottie';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(IonicModule.forRoot()),
    provideRouter(routes),
    provideHttpClient(),

    // TAMBAH DI SINI
    provideLottieOptions({
      player: () => import('lottie-web'),
    }),
  ],
}).catch(err => console.error(err));
