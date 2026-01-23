import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CapacitorHttp } from '@capacitor/core';

@Component({
  selector: 'app-qris-modal',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './qris-modal.page.html',
  styleUrls: ['./qris-modal.page.scss'],
})
export class QrisModalPage implements OnInit {
  @Input() amount: number = 0;
  @Input() customer_name: string = '';
  @Input() customer_email: string = '';
  @Input() customer_phone: string = '';

  qrUrl: string = '';
  loading: boolean = true;

  constructor(private modalCtrl: ModalController) {}

  async ngOnInit() {
    try {
      const response = await CapacitorHttp.post({
        url: 'https://epos.pringapus.com/api/v1/cart/get_qris_static',
        headers: { 'Content-Type': 'application/json' },
        data: {
          amount: this.amount,
          customer_name: this.customer_name,
          customer_email: this.customer_email,
          customer_phone: this.customer_phone
        }
      });

      if (response.data?.status) {
        this.qrUrl = response.data.qr_image;
      }
      

      this.loading = false;
    } catch (err) {
      console.error(err);
      this.loading = false;
    }

    console.log('Amount for QRIS:', this.amount);
    console.log('Customer Name:', this.customer_name);
    console.log('Customer Email:', this.customer_email);
    console.log('Customer Phone:', this.customer_phone);
    console.log('img', this.qrUrl);
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
