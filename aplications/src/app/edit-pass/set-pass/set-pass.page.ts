import { Component, OnInit } from '@angular/core';
import { CapacitorHttp } from '@capacitor/core';
import { StorageService } from 'src/app/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-set-pass',
  templateUrl: './set-pass.page.html',
  styleUrls: ['./set-pass.page.scss'],
  standalone: false,
})
export class SetPassPage implements OnInit {

  userData: any               = null;
  id: string                  = '';
  username: string            = '';
  password: string            = '';
  confirmPassword: string     = '';
  showPassword: boolean       = false;
  showConfirmPassword: boolean= false;
  constructor(private storageService: StorageService, public router: Router) { }

  ngOnInit() {
    this.userData = this.storageService.getUserData();
    this.username = this.storageService.getUserName() || '';
    this.id = this.storageService.getUserData()?.userData?.id || '';



  }

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  async saveChanges() {

    if (!this.id) {
        console.error('ID is missing');
        return;
    }

    if (this.password !== this.confirmPassword) {
        console.log('Passwords do not match');
        return;
    }

    if (this.username) {
        const data = {
            id: this.id,
            username: this.username,
            password: this.password ? this.password : null,
        };

        try {
            const response = await CapacitorHttp.post({
                url: 'https://epos.pringapus.com/api/v1/Authentication/updateUser',
                data: data,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                this.userData.username = this.username;
                localStorage.setItem('user_data', JSON.stringify(this.userData));
                console.log('Profile updated successfully');
                this.router.navigate(['tab/profile'])
            } else {
                console.error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    } else {
        console.log('Please fill in all fields');
    }
}


}
