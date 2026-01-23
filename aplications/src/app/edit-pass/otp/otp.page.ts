import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { StorageService } from 'src/app/storage.service';
import { CapacitorHttp } from '@capacitor/core';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
  standalone: false,
})
export class OtpPage implements OnInit {

  otp: string[] = ['', '', '', '', '', ''];
  telepon: string = '';
  formattedPhone: string = '';
  isVerifying: boolean = false;
  resendDisabled: boolean = true;
  countdown: number = 60;

  constructor(public router: Router, private toastController: ToastController, private storageService: StorageService) { }

  ngOnInit() {
    this.telepon = this.storageService.getPhoneNumber() || '';
    this.formattedPhone = this.telepon.substring(0, 4) + '********';

    this.startResendCountdown();
  }

  moveToNext(event: any, nextInput?: HTMLInputElement) {
    const value = event.target.value;
    if (value.length === 1 && nextInput) {
      nextInput.focus();
    }
    this.checkOTP();
  }

  handleBackspace(event: any, prevInput?: HTMLInputElement, currentInput?: HTMLInputElement) {
    if (event.key === 'Backspace' && currentInput?.value === '' && prevInput) {
      prevInput.focus();
    }
  }

  checkOTP() {
    if (this.otp.every(digit => digit !== '')) {
      this.verifyOTP();
    }
  }

  async verifyOTP() {
    this.isVerifying = true;
    const enteredOTP = this.otp.join('');

    CapacitorHttp.post({
        url    : 'https://epos.pringapus.com/api/v1/Authentication/verifOtp',
        headers: { 'Content-Type': 'application/json' },
        data   : {
            phone: this.telepon,
            otp  : enteredOTP,
        },
    }).then(response => {
        const data = response.data;
        if (data.status) {
            this.showToast('OTP Valid! Lanjut ke Update Password.', 'success');
            this.router.navigate(['/edit-pass/set-pass']);
        } else {
            this.showToast('OTP Salah atau Expired! Coba lagi.', 'danger');
            this.otp = ['', '', '', '', '', ''];
        }
    }).catch(error => {
        console.error('Error verifying OTP:', error);
        this.showToast('Gagal memverifikasi OTP.', 'danger');
    }).finally(() => {
        this.isVerifying = false;
    });
  }


  startResendCountdown() {
    this.resendDisabled = true;
    this.countdown = 60;

    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(interval);
        this.resendDisabled = false;
      }
    }, 1000);
  }

  resendOTP() {
    CapacitorHttp.post({
        url    : 'https://epos.pringapus.com/api/v1/Authentication/requestOtp',
        headers: { 'Content-Type': 'application/json' },
        data   : { phone: this.telepon },
    }).then(response => {
        const data = response.data;
        if (data.status) {
            this.showToast('Kode OTP telah dikirim ulang.', 'success');
            this.startResendCountdown();
        } else {
            this.showToast('Gagal mengirim ulang OTP.', 'danger');
        }
    }).catch(error => {
        console.error('Error resending OTP:', error);
        this.showToast('Terjadi kesalahan saat mengirim ulang OTP.', 'danger');
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
    });
    toast.present();
  }
}
