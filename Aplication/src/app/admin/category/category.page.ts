import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonIcon, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  list, search, create, trash, add, 
  folderOpen, close, receipt, chevronBack, 
  chevronForward, cubeOutline, createOutline,
  addOutline, closeOutline,
  trashOutline, searchOutline, chevronBackOutline,
  chevronForwardOutline, folderOpenOutline
} from 'ionicons/icons';
import { CategoryService } from 'src/app/services/category.service';
import { AlertController, ToastController } from '@ionic/angular';
import { delay, finalize } from 'rxjs';

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonIcon, IonSpinner
  ]
})
export class CategoryPage implements OnInit {

  categories: any[] = [];
  loading = false;
  search = '';
  page = 1;
  totalPages = 1;

  showModal = false;
  isEdit = false;
  editId: number | null = null;

  form: any = { category_name: '' };
  searchTimeout: any;

  constructor(
    private categoryService: CategoryService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ 
      'list': list, 
      'search': search, 
      'create': create, 
      'trash': trash, 
      'add': add, 
      'folder-open': folderOpen, 
      'close': close, 
      'receipt': receipt, 
      'chevron-back': chevronBack, 
      'chevron-forward': chevronForward,
      'cube-outline': cubeOutline,
      'create-outline': createOutline,
      'add-outline': addOutline,
      'close-outline': closeOutline,
      'trash-outline': trashOutline,
      'search-outline': searchOutline,
      'chevron-back-outline': chevronBackOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'folder-open-outline': folderOpenOutline
    });
  }

  async showToast(msg: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: color,
      position: 'top',
      mode: 'ios'
    });
    toast.present();
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.categoryService.getCategories(this.page, 10, this.search)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (res: any) => {
          this.categories = res.data || [];
          this.totalPages = res.meta?.total_pages || 1;
        },
        error: () => {
          this.showToast('Gagal memuat data kategori', 'danger');
        }
      });
  }

  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.page = 1;
      this.loadData();
    }, 500);
  }

  openAddModal() {
    this.isEdit = false;
    this.form = { category_name: '' };
    this.showModal = true;
  }

  openEditModal(c: any) {
    this.isEdit = true;
    this.editId = c.id;
    this.form = { category_name: c.category_name };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editId = null;
  }

  save() {
    if (!this.form.category_name.trim()) {
      this.showToast('Nama kategori tidak boleh kosong', 'warning');
      return;
    }

    // Check duplicate
    const isDuplicate = this.categories.some(c => 
      c.category_name.toLowerCase() === this.form.category_name.toLowerCase().trim()
    );

    if (isDuplicate) {
      this.showToast('Kategori "' + this.form.category_name + '" sudah ada.', 'warning');
      return;
    }

    this.loading = true;
    this.categoryService.createCategory(this.form)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.showToast('Kategori berhasil ditambahkan');
          this.loadData();
          this.closeModal();
        },
        error: (err) => {
          const msg = this.extractErrorMessage(err) || 'Gagal menambahkan kategori';
          this.showToast(msg, 'danger');
        }
      });
  }

  update() {
    if (!this.editId) return;
    if (!this.form.category_name.trim()) {
      this.showToast('Nama kategori tidak boleh kosong', 'warning');
      return;
    }

    // Check duplicate (exclude current)
    const isDuplicate = this.categories.some(c => 
      c.id !== this.editId && 
      c.category_name.toLowerCase() === this.form.category_name.toLowerCase().trim()
    );

    if (isDuplicate) {
      this.showToast('Nama kategori sudah digunakan.', 'warning');
      return;
    }

    this.loading = true;
    this.categoryService.updateCategory(this.editId, this.form)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.showToast('Kategori berhasil diperbarui');
          this.loadData();
          this.closeModal();
        },
        error: (err) => {
          const msg = this.extractErrorMessage(err) || 'Gagal memperbarui kategori';
          this.showToast(msg, 'danger');
        }
      });
  }

  async delete(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Hapus Kategori?',
      message: 'Tindakan ini tidak dapat dibatalkan. Kategori yang dihapus akan mempengaruhi data produk terkait.',
      cssClass: 'premium-alert',
      buttons: [
        {
          text: 'Tidak',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Iya, Hapus',
          role: 'confirm',
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
    this.categoryService.deleteCategory(id)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: () => {
          this.showToast('Kategori berhasil dihapus');
          this.loadData();
        },
        error: (err) => {
          const msg = this.extractErrorMessage(err) || 'Gagal menghapus kategori.';
          this.showToast(msg, 'danger');
        }
      });
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.messages?.error) return err.error.messages.error;
    if (err.error?.message) return err.error.message;
    if (typeof err.error === 'string') return err.error;
    return '';
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadData();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadData();
    }
  }
}
