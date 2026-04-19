import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  IonContent,
  IonIcon, IonToast, IonSkeletonText, IonModal, IonInput, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBack, refreshOutline, lockClosed, key, logoWhatsapp, 
  phonePortraitOutline, chevronForward, shieldCheckmarkOutline, 
  createOutline, camera, helpCircleOutline, logOutOutline,
  heart, star, receiptOutline, personCircleOutline
} from 'ionicons/icons';
import { HomeService } from 'src/app/services/home.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonIcon, IonToast, IonSkeletonText, IonModal, IonInput, IonSpinner,
    CommonModule, FormsModule, RouterLink
  ]
})
export class ProfilePage implements OnInit {

  constructor(private homeService: HomeService, private router: Router) {
    addIcons({ 
      'arrow-back': arrowBack, 
      'refresh-outline': refreshOutline, 
      'lock-closed': lockClosed, 
      'key': key, 
      'logo-whatsapp': logoWhatsapp, 
      'phone-portrait-outline': phonePortraitOutline, 
      'chevron-forward': chevronForward, 
      'shield-checkmark-outline': shieldCheckmarkOutline, 
      'create-outline': createOutline, 
      'camera': camera, 
      'help-circle-outline': helpCircleOutline, 
      'log-out-outline': logOutOutline,
      'heart': heart,
      'star': star,
      'receipt-outline': receiptOutline,
      'person-circle-outline': personCircleOutline
    });
  }

  profile: any;
  loading = false;
  saving = false;

  /* DATA */
  points = 0;
  level = 'Bronze';
  memberId = '';

  /* FORM */
  name = '';
  email = '';
  phone = '';
  username = '';
  imageUrl: string | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  oldImage: string | null = null;

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  /* SECURITY & RESET */
  isSecurityVerified = false;
  securityPassword = '';
  resetPhone = '';
  securityMode: 'overview' | 'change' | 'reset' = 'overview';
  resetStep = 1; // 1: Input Phone, 2: OTP, 3: New Password
  otpCode = '';
  showSecurityModal = false;
  showPasswordChallenge = false;

  toastMsg = '';
  showToast = false;


  ngOnInit() {
    this.loadProfile();
  }

  goBack() {
    this.router.navigate(['/member/home']);
  }

  /* ================= LOAD ================= */

  loadProfile() {
    const userId = Number(localStorage.getItem('user_id'));
    if (!userId) {
      this.show('User tidak ditemukan');
      return;
    }

    this.loading = true;

    // Use getHome to get points and level
    this.homeService.getHome(userId).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (!res.status) {
          this.show('Gagal ambil profile');
          return;
        }

        const u = res.data.user;
        const m = res.data.member;
        
        this.name = u.name || '';
        this.email = u.email || '';
        this.phone = u.phone || '';
        this.username = u.username || '';
        this.imageUrl = u.image_url || null;
        this.oldImage = u.image || null;
        this.imagePreview = this.imageUrl;
        
        this.points = m?.active_points || 0;
        this.level = m?.membership_level || 'Bronze';
        this.memberId = m?.member_id || '';
      },
      error: () => {
        this.loading = false;
        this.show('Server error');
      }
    });
  }

  /* ================= PHOTO PICKER ================= */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
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

    // Create FormData for Multipart upload
    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('email', this.email);
    formData.append('phone', this.phone);
    formData.append('username', this.username);
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    if (this.oldImage) {
      formData.append('old_image', this.oldImage);
    }

    this.homeService.updateProfile(userId, formData).subscribe({
      next: (res: any) => {
        this.saving = false;

        if (res.status) {
          this.show('Profil berhasil diperbarui');
          this.loadProfile(); // Refresh data
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


  /* ================= UTIL ================= */

  /* ================= SECURITY SECTION ================= */

  openSecuritySection() {
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.securityMode = 'change';
    this.showSecurityModal = true;
  }

  submitChangePassword() {
    const userId = Number(localStorage.getItem('user_id'));
    if (!this.oldPassword || !this.newPassword || this.newPassword !== this.confirmPassword) {
      this.show('Periksa kembali inputan Anda');
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
          this.show('Success! Password berhasil diganti.');
          this.showSecurityModal = false;
          this.isSecurityVerified = false;
          // Clear forms
          this.oldPassword = ''; this.newPassword = ''; this.confirmPassword = '';
        } else {
          this.show(res.message);
        }
      },
      error: (err: any) => {
        this.saving = false;
        this.show(err.error?.message || 'Gagal ganti password');
      }
    });
  }

  /* ================= RESET PASSWORD FLOW ================= */

  handleForgotPassword() {
    this.showPasswordChallenge = false;
    this.resetStep = 1;
    this.resetPhone = this.phone; 
    this.securityMode = 'reset';
    this.showSecurityModal = true;
  }

  requestResetOTP() {
    if (!this.resetPhone) {
      this.show('Masukkan nomor HP');
      return;
    }

    this.saving = true;
    this.homeService.requestResetOTP(this.resetPhone).subscribe({
      next: (res: any) => {
        this.saving = false;
        if (res.success) {
          this.show(res.message);
          this.resetStep = 2; // Move to OTP
        } else {
          this.show(res.message);
        }
      },
      error: (err: any) => {
        this.saving = false;
        this.show(err.error?.message || 'Gagal mengirim OTP');
      }
    });
  }

  verifyResetOTP() {
    if (!this.otpCode || this.otpCode.length < 6) {
      this.show('Masukkan 6 digit kode OTP');
      return;
    }
    this.resetStep = 3; // In a real app, you might verify OTP here first, but here we'll verify it at the final commit
  }

  confirmReset() {
    if (!this.newPassword || this.newPassword !== this.confirmPassword) {
      this.show('Password tidak cocok');
      return;
    }

    this.saving = true;
    this.homeService.commitResetPassword({
      phone: this.resetPhone,
      otp: this.otpCode,
      password: this.newPassword
    }).subscribe({
      next: (res: any) => {
        this.saving = false;
        if (res.success) {
          this.show('Success! Silakan login kembali.');
          this.showSecurityModal = false;
          this.logout();
        } else {
          this.show(res.message || 'Gagal atur ulang sandi');
        }
      },
      error: (err: any) => {
        this.saving = false;
        this.show(err.error?.message || 'Terjadi kesalahan');
      }
    });
  }

  show(msg: string) {
    this.toastMsg = msg;
    this.showToast = true;
  }

  getInitial(): string {
    return this.name ? this.name.charAt(0).toUpperCase() : '?';
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

}
