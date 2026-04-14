import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonIcon, IonInput, IonSpinner, IonToast
} from '@ionic/angular/standalone';
import { HomeService, ProfileUser } from 'src/app/services/home.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
    IonIcon, IonInput, IonSpinner, IonToast,
    CommonModule, FormsModule
  ]
})
export class ProfilePage implements OnInit {

  profile!: ProfileUser;
  loading = false;
  saving = false;

  /* FORM */
  name = '';
  email = '';
  phone = '';
  username = '';

  oldPassword = '';
  newPassword = '';

  toastMsg = '';
  showToast = false;

constructor(
  private homeService: HomeService,
  private router: Router
) {}

  ngOnInit() {
    this.loadProfile();
  }

  /* ================= LOAD ================= */

  loadProfile() {
    const userId = Number(localStorage.getItem('user_id'));
    if (!userId) {
      this.show('User tidak ditemukan');
      return;
    }

    this.loading = true;

    this.homeService.getProfile(userId).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (!res.status) {
          this.show('Gagal ambil profile');
          return;
        }

        const u = res.data;
        this.profile = u;
        this.name = u.name || '';
        this.email = u.email || '';
        this.phone = u.phone || '';
        this.username = u.username || '';
      },
      error: () => {
        this.loading = false;
        this.show('Server error');
      }
    });
  }

  /* ================= UPDATE PROFILE ================= */

  updateProfile() {
    const userId = Number(localStorage.getItem('user_id'));
    if (!userId) return;

    if (!this.name || !this.username) {
      this.show('Nama & Username wajib diisi');
      return;
    }

    this.saving = true;

    this.homeService.updateProfile(userId, {
      name: this.name,
      email: this.email,
      phone: this.phone,
      username: this.username
    }).subscribe({
      next: (res: any) => {
        this.saving = false;

        if (res.status) {
          this.show('Profile updated');
        } else {
          this.show(res.message || 'Gagal update');
        }
      },
      error: () => {
        this.saving = false;
        this.show('Server error');
      }
    });
  }

  /* ================= CHANGE PASSWORD ================= */

  changePassword() {
    const userId = Number(localStorage.getItem('user_id'));
    if (!userId) return;

    if (!this.oldPassword || !this.newPassword) {
      this.show('Password tidak boleh kosong');
      return;
    }

    if (this.newPassword.length < 4) {
      this.show('Password minimal 4 karakter');
      return;
    }

    this.saving = true;

    this.homeService.changePassword(userId, {
      old_password: this.oldPassword,
      new_password: this.newPassword
    }).subscribe({
      next: (res: any) => {
        this.saving = false;

        if (res.status) {
          this.show('Password updated');
          this.oldPassword = '';
          this.newPassword = '';
        } else {
          this.show(res.message || 'Password salah');
        }
      },
      error: () => {
        this.saving = false;
        this.show('Server error');
      }
    });
  }

  /* ================= UTIL ================= */

  show(msg: string) {
    this.toastMsg = msg;
    this.showToast = true;
  }

  getInitials(name: string) {
    return name ? name.charAt(0).toUpperCase() : 'U';
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

}
