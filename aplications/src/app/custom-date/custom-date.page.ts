import { Component, Input, NgZone, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-custom-date',
  templateUrl: './custom-date.page.html',
  styleUrls: ['./custom-date.page.scss'],
  standalone: false,
})
export class CustomDatePage implements OnInit {
  @Input() selectedDate: string = '';
  minDate: string = '';

  constructor(private modalController: ModalController, private ngZone: NgZone) {}

  ngOnInit() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.minDate = today.toISOString().split('T')[0];

    if (!this.selectedDate) {
      this.selectedDate = new Date().toISOString();
    }
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  applyFilter() {
    console.log('Mengirim tanggal:', this.selectedDate);
    this.modalController.dismiss({ selectedDate: this.selectedDate });
  }
  
  

  formatDateTime(date: string): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Intl.DateTimeFormat('id-ID', options).format(new Date(date));
  }
}
