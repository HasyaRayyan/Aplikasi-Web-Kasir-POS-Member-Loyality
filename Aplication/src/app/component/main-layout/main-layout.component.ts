import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar.component';
import { AuthService } from 'src/app/services/auth.service';
import { OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-main-layout',
styleUrls: ['./main-layout.component.scss'],
  templateUrl: './main-layout.component.html',
  imports: [
    IonicModule,
    CommonModule,
    RouterModule, // ⬅️ WAJIB
    SidebarComponent,
  ],
})
export class MainLayoutComponent implements OnInit {

  name = '';
  today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.name = this.authService.getUsername();
  }
}
