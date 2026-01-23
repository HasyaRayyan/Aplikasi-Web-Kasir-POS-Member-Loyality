import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonModal } from '@ionic/angular/standalone';
import { IonRouterOutlet } from '@ionic/angular';
import { CartService } from '../services/cart.service';
import { CapacitorHttp } from '@capacitor/core';

interface Topping {
  id: string;
  id_outlet: string;
  id_category: string;
  id_parent_item: string;
  name: string;
  description: string;
  img_url: string;
  price: string;
  point: string;
  sale_price: string;
  status: string;
  selected: boolean;
}

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, IonModal],
})
export class DetailPage implements OnInit {
  @ViewChild('detailModal') detailModal!: IonModal;
  @ViewChild(IonRouterOutlet, { static: true }) ionRouterOutlet!: IonRouterOutlet;

  productId: number = 0;
  toppings: Topping[] = [];
  selectedToppings: Topping[] = [];  // Menyimpan topping yang dipilih
  item: any;
  qty: number = 1;
  isToppingEnabled: boolean = false;
  isDiscountEnabled: boolean = true; // Default true, nanti di-load dari localStorage

  selectedItem: any = null;

  constructor(public router: Router, private cartService: CartService) {}

  ngOnInit() {

    const storedToppingStatus = localStorage.getItem('isToppingEnabled');
    this.isToppingEnabled = storedToppingStatus ? JSON.parse(storedToppingStatus) : true; // Default true jika tidak ada status

    // Ambil item dari navigasi
      const navigation = this.router.getCurrentNavigation();
      if (navigation && navigation.extras.state) {
        this.item = navigation.extras.state['item'];
        this.productId = this.item.id;
        console.log('Product ID from item:', this.productId);
        this.getToppingsByProduct(this.productId);
      }
  }

  async getToppingsByProduct(productId: number) {
    if (!this.isToppingEnabled) {
      console.log("Topping dinonaktifkan.");
      this.toppings = []; // Kosongkan topping jika topping dinonaktifkan
      return;
    }

    try {
      const response = await CapacitorHttp.get({
        url: `https://epos.pringapus.com/api/v1/Product_category/get_toppings_by_product/${productId}`,
        headers: { 'Content-Type': 'application/json' },
      });

      const parsedData = JSON.parse(response.data);
      if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
        this.toppings = parsedData.data
          .filter((topping: Topping) => String(topping.id_parent_item) === String(productId))
          .map((topping: Topping) => ({ ...topping, selected: false }));
      } else {
        console.log('Tidak ada data atau data tidak terstruktur dengan benar.');
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat mengambil topping:', error);
    }
  }

  toggleToppingSelection(topping: Topping) {
    topping.selected = !topping.selected;
    console.log('Selected Toppings:', this.toppings.filter(t => t.selected));
  }

  calculateTotal(): number {
    let totalPrice = this.item ? this.item.price * this.qty : 0;
    this.toppings.filter(t => t.selected).forEach(topping => {
      totalPrice += parseFloat(topping.price);
    });
    return totalPrice;
  }

  addTopping(item: any, selectedToppings: Topping[]) {
    item.selectedToppings = selectedToppings;
    console.log('Updated Item with Toppings:', item);
  }

addToCart(item: any) {
  const selectedToppings = this.toppings.filter(topping => topping.selected);
  this.cartService.addToCart(item, this.qty, selectedToppings);
  this.detailModal.dismiss();
}

getDiscountPercentage(): number {
  if (!this.item || this.item.sale_price == 0) return 0;

  let hargaNormal = parseFloat(this.item.price);
  let hargaDiskon = parseFloat(this.item.sale_price);

  return Math.round(((hargaNormal - hargaDiskon) / hargaNormal) * 100);
}


  openModal(item: any) {
    this.item = item;
    this.qty = 1;
    this.selectedToppings = [];  // Reset topping yang dipilih setiap kali membuka modal
    this.detailModal.present();
    this.toppings.forEach(t => t.selected = false);
  }

  incrementQty() {
    this.qty += 1;
  }

  decrementQty() {
    if (this.qty > 1) {
      this.qty -= 1;
    }
  }



  setDefaultImage(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/image-not-found.png';
  }

  async deleteProduct(id: string) {
    if (!id) {
      console.error('ID produk tidak ditemukan');
      return;
    }

    const userConfirm = window.confirm("Apakah Anda yakin ingin menghapus produk ini?");
    if (!userConfirm) return;

    try {
      const response = await CapacitorHttp.post({
        url: `https://epos.pringapus.com/api/v1/Product_category/deleteProduct/${id}`,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.status) {
        this.router.navigate(['tab/home'], { state: { deletedItemId: id } });
      } else {
        console.error('Gagal menghapus produk:', response.data.message);
      }
    } catch (error) {
      console.error('Error saat menghapus produk:', error);
    }
  }
}
