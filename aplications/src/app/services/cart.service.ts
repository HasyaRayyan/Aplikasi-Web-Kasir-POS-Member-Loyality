import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems: any[] = [];
  private cartItemsSubject = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  private checkoutSubject = new BehaviorSubject<boolean>(false);
  checkout$ = this.checkoutSubject.asObservable();

  // panggil ini setelah sukses checkout
  notifyCheckout() {
    this.checkoutSubject.next(true);
  }

  constructor() {
    this.loadCartFromStorage();
  }

  private saveCartToStorage() {
    const user = JSON.parse(localStorage.getItem('user_data') || '{}');
    if (user?.userData?.username) {
      localStorage.setItem(`cart_${user.userData.username}`, JSON.stringify(this.cartItems));
    }
  }

  // private loadCartFromStorage() {
  //   const user = JSON.parse(localStorage.getItem('user_data') || '{}');
  //   if (user?.userData?.username) {
  //     const storedCart = localStorage.getItem(`cart_${user.userData.username}`);
  //     if (storedCart) {
  //       this.cartItems = JSON.parse(storedCart);
  //       this.cartItemsSubject.next(this.cartItems);
  //     }
  //   }
  // }

  private loadCartFromStorage() {
    const user = JSON.parse(localStorage.getItem('user_data') || '{}');
    if (user?.userData?.username) {
      const storedCart = localStorage.getItem(`cart_${user.userData.username}`);
      if (storedCart) {
        this.cartItems = JSON.parse(storedCart);
        this.cartItemsSubject.next(this.cartItems);
      } else {
        this.cartItems = [];
        this.cartItemsSubject.next(this.cartItems);
      }
    } else {
      this.cartItems = [];
      this.cartItemsSubject.next(this.cartItems);
    }
  }

  refreshFromStorage() {
    this.loadCartFromStorage();
  }

 // cart.service.ts
 addToCart(item: any, qty: number, selectedToppings: any[]) {
  const existingItem = this.cartItems.find(cartItem => cartItem.id === item.id);
  if (existingItem) {
    existingItem.qty += qty;
    existingItem.selectedToppings = selectedToppings;
  } else {
    this.cartItems.push({ ...item, qty, selectedToppings });
  }
  this.saveCartToStorage();
  this.cartItemsSubject.next(this.cartItems);
}



  getAvailableToppings() {
    // Menampilkan semua topping yang tersedia di keranjang
    return this.cartItems
      .map(item => item.selectedToppings || [])
      .reduce((acc, toppings) => acc.concat(toppings), []);
  }


  getCartItems() {
    console.log('ini this.cartItems:', this.cartItems);

    return this.cartItems;
  }

  getProduk() {
    const produk = this.getCartItems()[0];
    console.log("Mengambil name:", produk?.name);
    return produk?.name || '';
  }

  getPrice() {
    const price = this.getCartItems()[0];
    console.log("Mengambil name:", price?.price);
    return price?.price || '';
  }

  getPoint() {
    const point = this.getCartItems()[0];
    console.log("Mengambil name:", point?.point);
    return point?.point || '';
  }

  getPoint_sale() {
    const point_sale = this.getCartItems()[0];
    console.log("Mengambil name:", point_sale?.point_sale);
    return point_sale?.point_sale || '';
  }

  removeItem(item: any) {
    this.cartItems = this.cartItems.filter(cartItem => cartItem.id !== item.id);
    this.saveCartToStorage();
    this.cartItemsSubject.next(this.cartItems);
  }

  clearCart() {
    this.cartItems = [];
    this.saveCartToStorage();
    this.cartItemsSubject.next(this.cartItems);
  }

  setRefreshRiwayat() {
    localStorage.setItem('refresh_riwayat', 'true');
  }

  shouldRefreshRiwayat() {
    return localStorage.getItem('refresh_riwayat') === 'true';
  }

  clearRefreshRiwayat() {
    localStorage.removeItem('refresh_riwayat');
  }

  // Tambahkan fungsi untuk mendapatkan available toppings

}
