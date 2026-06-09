import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonIcon, IonSpinner, 
  IonModal, IonToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  imageOutline, addOutline, trashOutline, 
  createOutline, powerOutline, refreshOutline,
  closeOutline, cloudUploadOutline, timeOutline
} from 'ionicons/icons';
import { SliderService, Slider } from 'src/app/services/slider.service';
import { ToastController, AlertController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.page.html',
  styleUrls: ['./slider.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonIcon, IonSpinner, 
    IonModal, IonToggle
  ]
})
export class SliderPage implements OnInit {
  sliders: Slider[] = [];
  loading = false;
  search = '';
  apiBaseUrl = environment.apiBaseUrl;
  refreshTimestamp = Date.now();


  // Modal properties
  showModal = false;
  modalTitle = 'Add Slider';
  isEditing = false;
  
  // Form properties
  currentSlider: Partial<Slider> = {
    title: '',
    is_active: 1
  };
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private sliderService: SliderService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ 
      imageOutline, addOutline, trashOutline, 
      createOutline, powerOutline, refreshOutline,
      closeOutline, cloudUploadOutline, timeOutline
    });
  }

  ngOnInit() {
    this.loadSliders();
  }

  loadSliders() {
    this.loading = true;
    this.sliderService.getSliders(this.search).subscribe({
      next: (res) => {
        console.log('Sliders loaded:', res.data);
        this.sliders = res.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sliders:', err);
        this.showToast('Failed to load sliders', 'danger');
        this.loading = false;
      }
    });
  }

  openAddModal() {
    this.isEditing = false;
    this.modalTitle = 'Add New Slider';
    this.currentSlider = { title: '', is_active: 1 };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }

  openEditModal(slider: Slider) {
    this.isEditing = true;
    this.modalTitle = 'Edit Slider';
    this.currentSlider = { ...slider };
    this.selectedFile = null;
    // Use the robust utility method for the preview URL
    this.imagePreview = this.getSliderImage(slider.image);
    this.showModal = true;
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Ensure the preview is updated and detected
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveSlider() {
    if (!this.currentSlider.title) {
      this.showToast('Title is required', 'warning');
      return;
    }

    if (!this.isEditing && !this.selectedFile) {
      this.showToast('Image is required', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.currentSlider.title || '');
    formData.append('is_active', this.currentSlider.is_active ? '1' : '0');
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.loading = true;
    const request = this.isEditing 
      ? this.sliderService.updateSlider(this.currentSlider.id!, formData)
      : this.sliderService.createSlider(formData);

    request.subscribe({
      next: (res) => {
        this.showToast(res.message, 'success');
        this.refreshTimestamp = Date.now(); // Cache bust images
        this.showModal = false;
        this.loadSliders();
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Gagal menyimpan slider. Cek koneksi server.';
        this.showToast(errorMsg, 'danger');
        this.loading = false;
      }
    });
  }

  closeModal() {
    this.showModal = false;
  }

  async deleteSlider(slider: Slider) {
    const alert = await this.alertCtrl.create({
      header: 'Konfirmasi Hapus',
      message: `Apakah Anda yakin ingin menghapus slider "${slider.title}"? Tindakan ini tidak dapat dibatalkan.`,
      buttons: [
        { 
          text: 'Batal', 
          role: 'cancel',
          cssClass: 'secondary'
        },
        { 
          text: 'Ya, Hapus', 
          role: 'destructive',
          handler: () => {
            this.executeDelete(slider.id!);
          }
        }
      ]
    });
    await alert.present();
  }

  deleteFromModal() {
    if (this.currentSlider.id) {
      this.deleteSlider(this.currentSlider as Slider);
    }
  }

  private executeDelete(id: number) {
    this.loading = true;
    this.sliderService.deleteSlider(id).subscribe({
      next: (res) => {
        this.showToast(res.message, 'success');
        this.showModal = false;
        this.loadSliders();
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Gagal menghapus slider. Cek koneksi server.';
        this.showToast(errorMsg, 'danger');
        this.loading = false;
      }
    });
  }

  toggleStatus(slider: Slider) {
    const originalStatus = slider.is_active;
    // Optimistic update
    slider.is_active = (slider.is_active == 1) ? 0 : 1;

    this.sliderService.toggleStatus(slider.id!).subscribe({
      next: (res) => {
        slider.is_active = res.is_active;
        this.showToast(res.message, 'success');
      },
      error: () => {
        slider.is_active = originalStatus; // Rollback
        this.showToast('Gagal mengubah status status. Cek link server.', 'danger');
      }
    });
  }

  async showToast(msg: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  getSliderImage(imgName: string | null | undefined): string {
    if (!imgName) {
      // console.log('Empty image name');
      return '';
    }
    
    const baseUrl = this.apiBaseUrl.endsWith('/') ? this.apiBaseUrl.slice(0, -1) : this.apiBaseUrl;
    const fullUrl = `${baseUrl}/uploads/banners/${imgName}`;
    // console.log('Generated image URL:', fullUrl);
    return fullUrl;
  }

  handleImageError(slider: Slider) {
    console.warn(`Failed to load image for slider: ${slider.title}`);
    // Instead of clearing the image (which hides the <img> tag), 
    // we can set it to a local placeholder if desired, 
    // or just let the browser's broken image icon show (or our fallback div if we check for specific flag)
    // For now, let's just log it and NOT hide the card.
  }
}
