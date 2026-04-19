import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideLottieOptions } from 'ngx-lottie';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { register } from 'swiper/element/bundle';

// Register Swiper custom elements
register();

bootstrapApplication(AppComponent, {
  providers: [
    provideIonicAngular({}),
    provideRouter(routes),
    provideHttpClient(),

    // TAMBAH DI SINI
    provideLottieOptions({
      player: () => import('lottie-web'),
    }),
  ],
}).catch(err => console.error(err));
