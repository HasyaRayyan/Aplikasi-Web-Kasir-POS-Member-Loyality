import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cafe, sparkles, arrowForwardCircle, ticketOutline, locationOutline, 
  helpCircleOutline, personOutline, cafeOutline, giftOutline, 
  chevronForward, ribbon, starOutline, refreshOutline 
} from 'ionicons/icons';
import { Router, RouterModule } from '@angular/router';
import { HomeService } from 'src/app/services/home.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-guest',
  templateUrl: './guest.page.html',
  styleUrls: ['./guest.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GuestPage implements OnInit {

  products: any[] = [];
  banners: any[] = [];
  apiUrl = environment.apiBaseUrl;

  constructor(
    private homeService: HomeService,
    private router: Router
  ) { 
    addIcons({ 
      cafe, sparkles, arrowForwardCircle, ticketOutline, locationOutline, 
      helpCircleOutline, personOutline, cafeOutline, giftOutline, 
      chevronForward, ribbon, starOutline, refreshOutline
    });
  }

  ngOnInit() {
    this.loadGuestHome();
  }

  loadGuestHome() {
    this.homeService.getGuestHome().subscribe({
      next: (res) => {
        if (res.status) {
          /* PRODUK */
          this.products = (res.data.products || []).map((p: any) => ({
            id: p.id,
            name: p.product_name,
            price: Number(p.price),
            image: p.image
              ? `${this.apiUrl}/uploads/products/${p.image}`
              : null
          }));

          /* BANNER */
          this.banners = (res.data.banners || []).map((b: any) => ({
            ...b,
            image: b.image 
              ? `${this.apiUrl}/uploads/banners/${b.image}`
              : 'assets/img/default-banner.jpg'
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
