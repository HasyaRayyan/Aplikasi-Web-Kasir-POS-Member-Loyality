import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StorageService } from 'src/app/storage.service';
import { CapacitorHttp } from '@capacitor/core';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
  standalone: false,
})
export class UserPage implements OnInit {
  userData: any = null;
  username: string = '';
  password: string = '';
  user_level: string = '';
  id_outlet: string = '';
  accountList: any[] = [];
  searchQuery: string = ''; // Tambahkan properti untuk search query
  filteredAccountList: any[] = []; 
  isLoading = false;
  errorMessage = '';
  editMode = false;
  editingUserId: string | null = null;

  addUser = false;
  isEditModalOpen = false;
  selectedUser: any = { id_user: '', username: '', password: '', users_level: '' };

  constructor(private storageService: StorageService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.user_level = this.storageService.getUserLevel();
    this.loadUserData();
  }
  closeEditUser() {
    this.isEditModalOpen = false;
  }

  loadUserData() {
    const storedUserData = localStorage.getItem('user_data');
    if (storedUserData) {
      this.userData = JSON.parse(storedUserData);
      this.username = this.userData.userData.username;
      this.user_level = this.userData.userData.member_level;
      this.id_outlet = this.userData.userData.id_outlet;
      this.fetchAccount();
      this.cdr.detectChanges();
    } else {
      console.log('No user data found in localStorage');
    }
  }

  async fetchAccount() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await CapacitorHttp.get({
        url: `https://epos.pringapus.com/api/v1/Outlets/get_account/${this.id_outlet}`,
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data && response.data.status) {
        this.accountList = response.data.data.map((item: any) => ({
          id_user: item.id || '',
          username: item.username || 'Tidak diketahui',
          users_level: item.users_level || 'Tidak diketahui',
        }));
        this.filteredAccountList = [...this.accountList]; // Inisialisasi hasil pencarian
      } else {
        this.errorMessage = response.data.message || 'Data tidak ditemukan.';
      }
    } catch (error) {
      this.errorMessage = 'Terjadi kesalahan saat memuat data.';
      console.error('Error fetching data:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  deleteUser(id: string) {
    if (!id) {
      alert("Error: ID user tidak valid.");
      return;
    }

    const confirmDelete = confirm("Apakah Anda yakin ingin menghapus user ini?");
    if (!confirmDelete) return;

    CapacitorHttp.post({
      url: `https://epos.pringapus.com/api/v1/Outlets/delete_user/${id}`,
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        console.log("Response Delete:", response.data);
        if (response.data.status) {
          alert('User berhasil dihapus');
          this.fetchAccount(); // Refresh daftar user setelah delete
        } else {
          alert('Gagal menghapus user');
        }
      })
      .catch(error => {
        console.error('Error deleting user:', error);
        alert('Terjadi kesalahan saat menghapus user.');
      });
  }


  filterUsers() {
    if (!this.searchQuery.trim()) {
      this.filteredAccountList = [...this.accountList]; // Kembalikan ke semua data jika kosong
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredAccountList = this.accountList.filter(account =>
      account.username.toLowerCase().includes(query)
    );
  }

  openEditModal(user: any) {
    if (!user || !user.id_user) {
      alert("Data user tidak valid. Cek apakah ID user ada.");
      return;
    }

    this.selectedUser = {
      id_user: user.id_user,
      username: user.username,
      password: '', // Reset password biar kosong (opsional)
      users_level: user.users_level
    };

    console.log("User yang akan diedit:", this.selectedUser); // Debugging
    this.isEditModalOpen = true; // Buka modal
    this.cdr.detectChanges();
  }


  updateUser() {
    if (!this.selectedUser.id_user) {
      alert('User tidak valid.');
      return;
    }

    const updateData: any = {
      id_user: this.selectedUser.id_user,
      username: this.selectedUser.username,
      users_level: this.selectedUser.users_level
    };

    // Kirim password hanya jika diisi oleh user
    if (this.selectedUser.password) {
      updateData.password = this.selectedUser.password;
    }

    console.log("Data yang dikirim ke API:", updateData);

    CapacitorHttp.post({
      url: 'https://epos.pringapus.com/api/v1/Outlets/update_user',
      headers: { 'Content-Type': 'application/json' },
      data: updateData,
    })
    .then(response => {
      console.log("Response Update:", response.data);
      if (response.data.status) {
        alert('User berhasil diperbarui');
        this.fetchAccount(); // Refresh data
        this.closeEditUser(); // Tutup modal setelah update
      } else {
        alert('Gagal memperbarui user');
      }
    })
    .catch(error => {
      console.error('Error updating user:', error);
      alert('Terjadi kesalahan saat memperbarui user.');
    });
  }




  addEmployee() {
    if (!this.username || !this.password) {
      alert('Warning: Username dan password harus diisi.');
      return;
    }

    let storedUserData = localStorage.getItem('user_data');
    let userData = storedUserData ? JSON.parse(storedUserData) : {};

    if (!userData?.userData?.id_outlet || !userData?.userData?.outlet_name) {
      alert('Error: Gagal mendapatkan data admin.');
      return;
    }

    const employeeData = {
      id_outlet: userData.userData.id_outlet,
      name: userData.userData.outlet_name,
      username: this.username,
      password: this.password,
    };

    CapacitorHttp.post({
      url: 'https://epos.pringapus.com/api/v1/Outlets/add_employe',
      headers: { 'Content-Type': 'application/json' },
      data: employeeData,
    })
      .then((response: any) => {
        if (response.data && response.data.status) {
          alert('Success: Karyawan berhasil ditambahkan.');
          this.closeAddUser()
          this.clearForm();
          this.fetchAccount();
        } else {
          alert('Error: ' + (response.data.message || 'Gagal menambahkan karyawan.'));
        }
      })
      .catch((error) => {
        console.error('Error adding employee:', error);
        alert('Error: Terjadi kesalahan saat menambahkan karyawan.');
      });
  }

  clearForm() {
    this.username = '';
    this.password = '';
  }

  openAddUser() {
    this.addUser = true;
  }

  closeAddUser() {
    this.addUser = false;
  }

  showPassword: boolean       = false;
  showConfirmPassword: boolean= false;

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }


}
