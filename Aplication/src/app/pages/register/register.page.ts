import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegisterPage {

  loading = false;

  form: any = {
    name: '',
    username: '',
    email: '',
    phone: '',
    password: ''
  };

  constructor(private toastCtrl: ToastController) {}

  async toast(msg: string, color = 'danger') {
    const t = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'top',
      color
    });
    t.present();
  }

register(): void {

  if (!this.form.name) {
    this.toast('Nama wajib diisi');
    return;
  }

  if (!this.form.username) {
    this.toast('Username wajib diisi');
    return;
  }

  if (!this.form.email) {
    this.toast('Email wajib diisi');
    return;
  }

  if (!this.form.phone) {
    this.toast('No HP wajib diisi');
    return;
  }

  if (!this.form.password) {
    this.toast('Password wajib diisi');
    return;
  }

  this.loading = true;

  setTimeout(() => {
    this.loading = false;
    this.toast('Registrasi berhasil', 'success');
  }, 1200);
}

}
