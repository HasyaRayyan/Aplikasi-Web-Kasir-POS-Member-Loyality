import { Component, OnInit } from '@angular/core';
import { CapacitorHttp } from '@capacitor/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-edit-pass',
  templateUrl: './edit-pass.page.html',
  styleUrls: ['./edit-pass.page.scss'],
  standalone: false,
})
export class EditPassPage implements OnInit {

  form!: FormGroup;
  telepon: string = '';

  constructor(
    public router: Router,
    private storageService: StorageService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController,
  ) { }

  ngOnInit() {
    this.telepon = this.storageService.getPhoneNumber() || '';

    this.form = new FormGroup({
      phone: new FormControl({ value: this.telepon, disabled: true }, [Validators.required, Validators.maxLength(15)]),
    });
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color
    });
    toast.present();
  }

  async OpenAlert() {
    if (!this.telepon) {
      this.presentToast('Nomor telepon tidak ditemukan!', 'danger');
      return;
    }
    const formattedPhone = this.telepon.substring(0, 4) + '********';

    const alert = await this.alertController.create({
      header: `Kami akan mengirim OTP ke No ${formattedPhone}`,
      message: 'Apakah Anda ingin melanjutkan?',
      buttons: [
        {
          text: 'Batal',
          handler: () => { }
        },
        {
          text: 'Lanjutkan',
          handler: async () => {
            if (this.telepon != '') {
              this.sendOTP();
              this.router.navigate(['edit-pass/otp']);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async sendOTP() { // Added async keyword
    this.telepon = this.storageService.getPhoneNumber() || '';
    if (!this.telepon) {
      this.presentToast('Nomor telepon tidak ditemukan!', 'danger');
      return;
    }
    const body = {
      phone: this.telepon,
    };
    try { // Added try-catch block
      const response = await CapacitorHttp.post({ // Await the response
        url: 'https://epos.pringapus.com/api/v1/Authentication/requestOtp',
        headers: { 'Content-Type': 'application/json' },
        data: body,
      });
      // Handle successful response if needed (e.g., console.log(response))
    } catch (error) {
      console.error('Error sending OTP:', error);
      this.presentToast('Gagal mengirim OTP. Silakan coba lagi.', 'danger'); // Use toast
    }
  }
}