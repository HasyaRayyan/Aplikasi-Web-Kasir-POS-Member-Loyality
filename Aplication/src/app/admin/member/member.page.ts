import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonIcon, IonSpinner 
} from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  addOutline, searchOutline, eyeOutline, createOutline, 
  trashOutline, chevronBackOutline, chevronForwardOutline, 
  closeOutline, personOutline
} from 'ionicons/icons';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-member',
  templateUrl: './member.page.html',
  styleUrls: ['./member.page.scss'],
  standalone: true,
  imports: [
    IonIcon, IonSpinner,
    CommonModule, FormsModule
  ]
})
export class MemberPage implements OnInit {

  users: any[] = [];
  loading = false;

  search = '';
  page = 1;
  totalPages = 1;

  searchTimeout: any;
  newUser: any = {
    role_id: null,
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    membership_level: 'Basic',
    active_points: 0
  };

  roles: any[] = [];
  showModal = false;
  isEdit = false;
  editId: number | null = null;


constructor(
  private userService: UserService,
  private toastCtrl: ToastController,
  private alertCtrl: AlertController
) {
  addIcons({ 
    'add-outline': addOutline, 
    'search-outline': searchOutline, 
    'eye-outline': eyeOutline, 
    'create-outline': createOutline, 
    'trash-outline': trashOutline, 
    'chevron-back-outline': chevronBackOutline, 
    'chevron-forward-outline': chevronForwardOutline, 
    'close-outline': closeOutline,
    'person-outline': personOutline
  });
}

  ngOnInit() {
    this.loadData();
    this.loadRoles();
  }
loadRoles() {
  this.userService.getRoles().subscribe((res: any) => {
    this.roles = res.data || [];
  });
}


  async addToast(message: string, color: string = 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top',
      color
    });
    await toast.present();
  }

  // ================= LOAD =================
  loadData() {
    this.loading = true;

    this.userService.getUsers(this.page, 10, this.search)
      .subscribe((res: any) => {
        this.users = res.data || [];
        this.totalPages = res.meta?.total_pages || 1;
        this.loading = false;
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

  showDetailModal = false;
  selectedUser: any = null;

  openDetailModal(u: any) {
    this.selectedUser = u;
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedUser = null;
  }

  // ================= PAGINATION =================
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

  // ================= MODAL =================
openAddModal() {
  this.isEdit = false;
  this.showModal = true;

  this.newUser = {
    role_id: null,
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    membership_level: 'Basic',
    active_points: 0
  };
}


  openEditModal(u: any) {
    this.isEdit = true;
    this.showModal = true;
    this.editId = u.id;

    this.newUser = { ...u };
  }

  closeModal() {
    this.showModal = false;
    this.editId = null;
  }

  // ================= CRUD =================
  save() {
    if (!this.validateUser()) return;

    this.userService.createUser(this.newUser)
      .subscribe(() => {
        this.addToast('User berhasil ditambahkan', 'success');
        this.closeModal();
        this.loadData();
      });
  }


  update() {
    if (!this.editId) return;
    if (!this.validateUser()) return;

    this.userService.updateUser(this.editId, this.newUser)
      .subscribe(() => {
        this.addToast('User berhasil diupdate', 'success');
        this.closeModal();
        this.loadData();
      });
  }


  async delete(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Hapus User?',
      message: 'Apakah Anda yakin ingin menghapus user ini secara permanen?',
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
    this.userService.deleteUser(id)
      .subscribe(() => {
        this.addToast('User berhasil dihapus', 'success');
        this.loadData();
      });
  }



validateUser(): boolean {
  const name = (this.newUser.name || '').trim();
  const phone = (this.newUser.phone || '').trim();
  const email = (this.newUser.email || '').trim();
  const username = (this.newUser.username || '').trim();
  const password = (this.newUser.password || '').trim();

  // ================= WAJIB ISI =================
  if (!name) {
    this.addToast('Nama wajib diisi');
    return false;
  }

  if (!email) {
    this.addToast('Email wajib diisi');
    return false;
  }

  if (!phone) {
    this.addToast('Nomor telp wajib diisi');
    return false;
  }

  if (!username) {
    this.addToast('Username wajib diisi');
    return false;
  }

  if (!this.newUser.role_id) {
    this.addToast('Role wajib dipilih');
    return false;
  }


  // Password wajib hanya saat CREATE
  if (!this.isEdit && !password) {
    this.addToast('Password wajib diisi');
    return false;
  }

  // ================= FORMAT =================

  // PHONE
  if (phone.length < 11 || phone.length > 13) {
    this.addToast('Nomor telp harus 11 - 13 digit');
    return false;
  }

  // EMAIL
  if (!email.endsWith('@gmail.com')) {
    this.addToast('Email harus menggunakan @gmail.com');
    return false;
  }

  // PASSWORD MIN 6 (saat create atau saat edit tapi diisi)
  if ((!this.isEdit && password.length < 6) || (this.isEdit && password && password.length < 6)) {
    this.addToast('Password minimal 6 karakter');
    return false;
  }

  return true;
}


}
