import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { StorageService } from './storage.service';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx'; 

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [ { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, StorageService,File,
    AppVersion, StorageService],
  bootstrap: [AppComponent],
})
export class AppModule {}
