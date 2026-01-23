import { Component, OnInit, Renderer2 } from '@angular/core';
import { CapacitorHttp } from '@capacitor/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular'; // Import AlertController
import { SuccessAnimationComponentPage } from '../success-animation-component/success-animation-component.page';
import { FailAnimationComponentPage } from '../fail-animation-component/fail-animation-component.page';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  packages: any[] = [];
  selectedPackage: any = null;
  isPaid: boolean = false;
  name: string = '';
  address: string = '';
  phone: string = '';
  paymentMethod: string = '';
  cardType: string = '';
  cardNumber: string = '';
  paymentId: string = '';
  outletId: string = '';
  otp: string[] = ['', '', '', '', '', ''];

  isOtpVerified: boolean = false;
  isOtpSent = false;
  otpExpireTime: number = 0;
  otpSentTime: number = 0;
  otpResendCooldown: number = 60;
  otpCooldownRemaining: number = 0;
  otpVerify: boolean = false;
  isTrial: boolean = false;
  constructor(private renderer: Renderer2, private router: Router, private alertController: AlertController, private modalController: ModalController) { // Inject AlertController
    this.loadPackages();
  }

  private isAnimationPlaying = false;

  async showSuccessAnimation() {
    if (this.isAnimationPlaying) return;
    this.isAnimationPlaying = true;

    const modal = await this.modalController.create({
      component: SuccessAnimationComponentPage,
      backdropDismiss: false
    });

    await modal.present();

    setTimeout(() => {
      modal.dismiss();
      this.isAnimationPlaying = false;
    }, 3000);
  }

  async presentAlert(header: string, message: string) {  // Function to show alert using AlertController
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  selectPackage(pkgName: string) {
    const selected = this.packages.find(pkg => pkg.name === pkgName);
    if (selected) {
      this.selectedPackage = selected;
      this.isPaid = false;
      console.log('Selected Package:', this.selectedPackage);
    } else {
      console.error('Package not found');
    }
  }

  validatePhoneNumber(event: any) {
    let input = event.target.value.replace(/[^0-9]/g, '');

    if (!input.startsWith('0')) {
      input = '0' + input;
    }

    input = input.replace(/^0+/, '0');

    if (input.length > 15) {
      input = input.substring(0, 15);
    }

    this.phone = input;
  }

  getPrice(pkgName: string): number {
    const pkg = this.packages.find(p => p.name === pkgName);
    return pkg ? pkg.price : 0;
  }

  getSalePrice(pkgName: string): number {
    const pkg = this.packages.find(p => p.name === pkgName);
    return pkg ? pkg.sale_price : 0;
  }
  getPackageDetail(pkgName: string): string[] {
    const pkg = this.packages.find(p => p.name === pkgName);
    if (!pkg) return ["No details available"];

    let detail = pkg.package_detail;

    try {
        const parsed = JSON.parse(detail);

        // Jika hasil parsing adalah array
        if (Array.isArray(parsed)) {
            return parsed.map(d => 
                typeof d === "object" 
                    ? Object.values(d).map(value => String(value)).join(", ") 
                    : String(d)
            );
        }
        // Jika hasil parsing adalah objek
        else if (typeof parsed === "object") {
            return Object.values(parsed).map(value => String(value));
        }
        // Jika hasil parsing adalah string atau tipe data lain
        return [String(parsed)];
    } catch {
        // Jika parsing gagal, kembalikan dalam bentuk array satu elemen
        return [detail];
    }
}


  payForPackage() {
    if (!this.paymentMethod) {
      this.presentAlert('Perhatian', 'Please select a payment method');
      return;
    }

    // Jika bukan Cash, harus isi Payment ID
    let requestData: any = {
      id_outlet: this.outletId,
      payment_method: this.paymentMethod,
    };

    if (this.paymentMethod !== 'CA') {
      if (!this.paymentId) {
        this.presentAlert('Perhatian', 'Please enter your Payment ID');
        return;
      }
      requestData.payment_id = this.paymentId; // Tambahkan hanya jika bukan "CA"
    }

    // Kirim data ke API
    CapacitorHttp.post({
      url: 'https://epos.pringapus.com/api/v1/Authentication/update_payment_method',
      headers: { 'Content-Type': 'application/json' },
      data: requestData, // Hanya kirim yang perlu
    }).then(response => {
      // this.presentAlert('Sukses', 'Payment method updated successfully!');
      this.showSuccessAnimation()
      this.isModalOpen = false
      // this.isPaid = true;
    }).catch(error => {
      this.presentAlert('Error', 'Payment failed.');
    });
  }


  loadPackages() {
    CapacitorHttp.get({
      url: 'https://epos.pringapus.com/api/v1/Authentication/getPackages',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response: any) => {
        if (response.data.status) {
          this.packages = response.data.data;
        } else {
          this.presentAlert('Gagal', 'Failed to load packages'); // AlertController
        }
      })
      .catch((err) => {
        console.error(err);
        this.presentAlert('Error', 'Error fetching packages'); // AlertController
      });
  }
  register() {
    if (!this.name || !this.address || !this.phone || !this.selectedPackage) {
      this.presentAlert('Perhatian', 'All fields must be filled, including package selection');
      return;
    }

    console.log("Selected Package:", this.selectedPackage);

    const isTrial = this.selectedPackage.isTrial ?? false; // Tentukan apakah ini akun trial

    const data = {
      name: this.name,
      address: this.address,
      phone: this.phone,
      member_level: this.selectedPackage.id,
      is_trial: isTrial
    };

    console.log("Data sent to backend:", data);

    CapacitorHttp.post({
      url: 'https://epos.pringapus.com/api/v1/Authentication/register',
      data: data,
      headers: { 'Content-Type': 'application/json' },
    })
    .then((response) => {
      if (response.data.status) {
        this.outletId = response.data.data.id_outlet;
        localStorage.setItem('outletId', this.outletId);
        this.presentAlert('Sukses', 'Registration successful! OTP sent to your phone.');
        console.log('Outlet ID:', this.outletId);

        localStorage.setItem('otp', response.data.otp);

        // Simpan is_trial di localStorage agar tidak hilang setelah verifikasi OTP
        localStorage.setItem('is_trial', JSON.stringify(isTrial));

        this.isOtpSent = true;
        this.otpSentTime = Date.now();
        this.otpCooldownRemaining = this.otpResendCooldown;
        this.startOtpCooldown();
      } else {
        this.presentAlert('Gagal', response.data.message);
      }
    })
    .catch((err) => {
      console.error(err);
      this.presentAlert('Error', 'Error during registration');
    });
}



  selectPackageTrial() {
    this.selectedPackage = { id: 3, name: 'Bronze', isTrial: true };
    this.isTrial = true; // Bronze, tapi trial
    console.log("Selected Package (Trial):", this.selectedPackage);
    this.openModal();
  }


  isOpenRegister = false;

  openRegister() {
    this.isOpenRegister = true;
  }


  verifyOtp() {
    if (!this.otp) {
      this.presentAlert('Perhatian', 'Please enter OTP');
      return;
    }

    const storedOtp = localStorage.getItem('otp') ?? '';

    if (this.otp.join('') !== storedOtp) {
      this.presentAlert('Gagal', "OTP tidak cocok!");
      return;
    }

    // Ambil kembali `is_trial` dari localStorage
    const isTrial = JSON.parse(localStorage.getItem('is_trial') ?? 'false');

    const data = {
      otp: this.otp,
      phone: this.phone,
      is_trial: isTrial // Kirim ulang ke backend
    };

    CapacitorHttp.post({
      url: 'https://epos.pringapus.com/api/v1/Authentication/verify_otp',
      data: data,
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (response.data.status) {
          // this.presentAlert('Sukses', 'OTP verified successfully!');
          localStorage.removeItem('otp');
          localStorage.removeItem('is_trial'); // Hapus setelah sukses verifikasi
          this.otpVerify = true;

          // Pastikan `isTrial` terisi dengan benar
          this.isTrial = isTrial;
          console.log('Status trial:', this.isTrial);

          // Jika trial, langsung tandai sebagai isPaid = true
          if (this.isTrial) {
            this.showSuccessAnimation()
            this.isModalOpen = false
          } else {
            this.isPaid = false; // Akun non-trial tetap harus bayar dulu
            console.log('Akun non-trial, harus bayar dulu');
          }
        } else {
          this.presentAlert('Gagal', response.data.message);
        }
      })
      .catch((err) => {
        console.error(err);
        this.presentAlert('Error', 'Error verifying OTP');
      });
  }


  resendOtp() {
    if (this.otpCooldownRemaining > 0) {
      this.presentAlert('Perhatian', `Please wait ${this.otpCooldownRemaining} seconds before requesting OTP again.`); // AlertController
      return;
    }

    CapacitorHttp.post({
      url: 'https://epos.pringapus.com/api/v1/Authentication/resend_otp',
      data: { name: this.name, address: this.address, phone: this.phone },
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (response.data.status) {
          this.presentAlert('Sukses', 'OTP sent to your phone again!'); // AlertController
          localStorage.setItem('otp', response.data.otp);
          this.otpSentTime = Date.now();
          this.otpCooldownRemaining = this.otpResendCooldown;
          this.startOtpCooldown();
        } else {
          this.presentAlert('Gagal', response.data.message); // AlertController
        }
      })
      .catch((err) => {
        console.error(err);
        this.presentAlert('Error', 'Error sending OTP'); // AlertController
      });
  }

  // Mulai countdown untuk cooldown OTP
  startOtpCooldown() {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.otpSentTime) / 1000);  // Hitung detik sejak OTP dikirim
      this.otpCooldownRemaining = Math.max(0, this.otpResendCooldown - elapsed);  // Update cooldown

      if (this.otpCooldownRemaining <= 0) {
        clearInterval(interval);  // Hentikan countdown ketika cooldown selesai
      }
    }, 1000);
  }


  currentRightValue: number = 0;

  moveRight() {
    if (this.currentRightValue < 200) {
      this.currentRightValue += 100; // Tambahkan 100% ke nilai 'right'
      this.updateSliderPosition();
    }
  }

  // Fungsi untuk menangani klik tombol kiri
  moveLeft() {
    if (this.currentRightValue > 0) {
      this.currentRightValue -= 100; // Kurangi 100% dari nilai 'right'
      this.updateSliderPosition();
    }
  }

  // Fungsi untuk memperbarui posisi slider
  private updateSliderPosition() {
    const sliders = document.querySelectorAll('.slider-container') as NodeListOf<HTMLElement>;
    sliders.forEach((slider) => {
      this.renderer.setStyle(slider, 'right', `${this.currentRightValue}%`);
    });
  }

  back() {
    this.router.navigate(['login'])
  }

  isModalOpen = false;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  login() {
    this.router.navigate(['login']);
  }

  moveToNext(event: any, nextInput?: HTMLInputElement) {
    const value = event.target.value;
    if (value.length === 1 && nextInput) {
      nextInput.focus();
    }
    // this.checkOTP();
  }

  handleBackspace(event: any, prevInput?: HTMLInputElement, currentInput?: HTMLInputElement) {
    if (event.key === 'Backspace' && currentInput?.value === '' && prevInput) {
      prevInput.focus();
    }
  }

}
