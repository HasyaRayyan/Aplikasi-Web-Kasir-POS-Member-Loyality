import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cafe, sparkles, arrowForwardCircle, ticketOutline, locationOutline, helpCircleOutline, personOutline, cafeOutline, giftOutline, chevronForward } from 'ionicons/icons';
import { Router, RouterModule } from '@angular/router';
import { HomeService } from 'src/app/services/home.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-guest',
  templateUrl: './guest.page.html',
  styleUrls: ['./guest.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule, RouterModule]
})
export class GuestPage implements OnInit {

  products: any[] = [];
  apiUrl = environment.apiBaseUrl;

  constructor(
    private homeService: HomeService,
    private router: Router
  ) { 
    addIcons({ cafe, sparkles, arrowForwardCircle, ticketOutline, locationOutline, helpCircleOutline, personOutline, cafeOutline, giftOutline, chevronForward });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.homeService.getProducts(4).subscribe({
      next: (res) => {
        if (res.status) {
          this.products = res.data.map((p: any) => ({
            ...p,
            image: p.image ? `${this.apiUrl}/uploads/products/${p.image}` : null
          }));
        }
      }
    });
  }

  formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID').format(price);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
