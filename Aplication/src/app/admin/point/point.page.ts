import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonIcon, IonSpinner 
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  addOutline, searchOutline, createOutline, trashOutline, 
  chevronBackOutline, chevronForwardOutline, starOutline, 
  closeOutline 
} from 'ionicons/icons';
import { PointService } from 'src/app/services/point.service';

@Component({
  selector: 'app-point',
  templateUrl: './point.page.html',
  styleUrls: ['./point.page.scss'],
  standalone: true,
  imports: [
    IonIcon, IonSpinner,
    CommonModule, FormsModule
  ]
})
export class PointPage implements OnInit {

  rules: any[] = [];
  loading = false;

showSuccessAlert = false;
successMessage = '';

  page = 1;
  totalPages = 1;
  search = '';

  showModal = false;
  isEdit = false;
  editId: number | null = null;

  newRule: any = {
    event_name: '',
    start_date: '',
    end_date: '',
    amount_per_point: 0,
    point_value: 0,
    is_active: 1
  };

  constructor(
    private pointService: PointService,
    private alertCtrl: AlertController
  ) {
    addIcons({ 
      'add-outline': addOutline, 
      'search-outline': searchOutline, 
      'create-outline': createOutline, 
      'trash-outline': trashOutline, 
      'chevron-back-outline': chevronBackOutline, 
      'chevron-forward-outline': chevronForwardOutline, 
      'star-outline': starOutline, 
      'close-outline': closeOutline 
    });
  }

  ngOnInit() {
    this.loadData();
  }

  // ===== LOAD =====
  loadData() {
    this.loading = true;

    this.pointService.getRules(this.page, this.search)
      .subscribe((res:any) => {
        this.rules = res.data || [];
        this.totalPages = res.meta?.total_pages || 1;
        this.loading = false;
      });
  }

  // ===== MODAL =====
  openAddModal() {
    this.isEdit = false;
    this.showModal = true;
    this.newRule = {
      event_name: '',
      start_date: '',
      end_date: '',
      amount_per_point: 0,
      point_value: 0,
      is_active: 1
    };
  }

  openEditModal(r: any) {
    this.isEdit = true;
    this.editId = r.id;
    this.showModal = true;
    this.newRule = { ...r };
  }

  closeModal() {
    this.showModal = false;
    this.editId = null;
  }

save() {
  this.pointService.createRule(this.newRule).subscribe(() => {
    this.successMessage = 'Rule berhasil ditambahkan';
    this.showSuccessAlert = true;
    this.closeModal();
    this.loadData();
  });
}

update() {
  if (!this.editId) return;

  this.pointService.updateRule(this.editId, this.newRule)
    .subscribe(() => {
      this.successMessage = 'Rule berhasil diperbarui';
      this.showSuccessAlert = true;
      this.closeModal();
      this.loadData();
    });
}

  async delete(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Hapus Rule Point?',
      message: 'Apakah Anda yakin ingin menghapus aturan poin ini secara permanen?',
      cssClass: 'premium-alert',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Hapus',
          role: 'destructive',
          cssClass: 'alert-button-confirm',
          handler: () => {
             this.executeDelete(id);
          }
        }
      ]
    });
    await alert.present();
  }
  executeDelete(id: number) {
    this.loading = true;
    this.pointService.deleteRule(id)
      .subscribe(() => {
        this.loadData();
      });
  }


  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadData();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadData();
    }
  }
}
