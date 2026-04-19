import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

/* ========= INTERFACE HOME ========= */

export interface HomeUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  image?: string;
  image_url?: string;
}

export interface HomeMember {
  member_id: string;
  active_points: number;
  lifetime_points: number;
  membership_level: string;
}

export interface HomeTransaction {
  id: number;
  invoice_code: string;
  total_price: string;
  total_point: number;
  payment_method: string;
  created_at: string;
}

export interface HomeProduct {
  id: number;
  product_name: string;
  image: string | null;
  price: string;
  point_price: number;
  is_exchangeable: string | number;
}

export interface HomeBanner {
  id: number;
  title: string;
  image: string;
}

export interface HomeResponse {
  status: boolean;
  data: {
    user: HomeUser;
    member: HomeMember;
    recent_transactions: HomeTransaction[];
    products: HomeProduct[];
    banners: HomeBanner[];
  };
}

/* ========= INTERFACE RIWAYAT ========= */

export interface RiwayatAddon {
  id: number;
  addon_name: string;
  addon_price: string;
}

export interface RiwayatItem {
  id: number;
  product_id: number;
  product_name: string;
  price: string;
  qty: number;
  subtotal: string;
  addons: RiwayatAddon[];
}

/* ========= INTERFACE PROFILE ========= */

export interface ProfileUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  username: string;
  image?: string;
  image_url?: string;
  created_at: string;
}

export interface ProfileResponse {
  status: boolean;
  data: ProfileUser;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  phone: string;
  username: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}


export interface RiwayatTransaction {
  id: number;
  invoice_code: string;
  customer_name: string;
  total_price: string;
  total_point: number;
  payment_method: string;
  created_at: string;
  cash_paid: string;
  change_money: string;
  items: RiwayatItem[];
}

export interface RiwayatResponse {
  status: boolean;
  data: RiwayatTransaction[];
}

/* ========= INTERFACE REDEMPTION ========= */

export interface RedemptionItem {
  id: number;
  product_id: number;
  product_name: string;
  image: string | null;
  product_image?: string | null;
  points_used: number;
  status: 'pending' | 'claimed' | 'expired';
  redeemed_at: string;
  claimed_at: string | null;
  expired_at: string;
  redemption_code: string;
}

export interface RedemptionResponse {
  status: boolean;
  data: RedemptionItem[];
}

/* ========= INTERFACE POINT HISTORY ========= */

export interface PointHistoryItem {
  id: number;
  invoice_code: string;
  points: number;
  status: 'active' | 'used' | 'expired';
  expired_at: string;
  created_at: string;
}

export interface PointHistoryResponse {
  status: boolean;
  data: {
    total_points: number;
    history: PointHistoryItem[];
  };
}

/* ========= SERVICE ========= */

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient) {}

  /* GET ALL PRODUCTS (FOR GUEST/ADMIN) */
  getProducts(limit: number = 10): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/api/products?limit=${limit}`);
  }

  /* GET DATA HOME MEMBER */
  getHome(userId: number): Observable<HomeResponse> {
    return this.http.get<HomeResponse>(
      `${environment.apiBaseUrl}/api/home-member/${userId}`
    );
  }

  /* GET RIWAYAT MEMBER */
  getRiwayat(userId: number): Observable<RiwayatResponse> {
    return this.http.get<RiwayatResponse>(
      `${environment.apiBaseUrl}/api/riwayat-member/${userId}`
    );
  }

  /* GET PROFILE USER */
  getProfile(userId: number): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(
      `${environment.apiBaseUrl}/api/profile/${userId}`
    );
  }

  /* UPDATE PROFILE (FormData supports File upload) */
  updateProfile(userId: number, formData: FormData) {
    return this.http.post(
      `${environment.apiBaseUrl}/api/profile/update/${userId}`,
      formData
    );
  }

  /* CHANGE PASSWORD */
  changePassword(userId: number, payload: ChangePasswordPayload) {
    return this.http.post(
      `${environment.apiBaseUrl}/api/profile/password/${userId}`,
      payload
    );
  }

  /* VERIFY CURRENT PASSWORD (Identity Challenge) */
  verifyPassword(userId: number, password: string): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/api/auth/verify-password`, {
      user_id: userId,
      password: password
    });
  }

  /* REQUEST RESET PASSWORD OTP */
  requestResetOTP(phone: string): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/api/auth/reset-password/request`, { phone });
  }

  /* VERIFY RESET OTP & CHANGE PASSWORD */
  commitResetPassword(payload: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/api/auth/reset-password/verify`, payload);
  }

  /* REDEEM PRODUCT */
  redeemProduct(userId: number, productId: number): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/api/member/redeem`, {
      user_id: userId,
      product_id: productId
    });
  }

  /* GET EXCHANGEABLE PRODUCTS */
  getExchangeableProducts(): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/api/member/exchangeable-products`);
  }

  /* GET MEMBER REDEMPTIONS */
  getMemberRedemptions(userId: number): Observable<RedemptionResponse> {
    return this.http.get<RedemptionResponse>(`${environment.apiBaseUrl}/api/member/redemptions/${userId}`);
  }

  /* GET POINT HISTORY */
  getPointHistory(userId: number): Observable<PointHistoryResponse> {
    return this.http.get<PointHistoryResponse>(`${environment.apiBaseUrl}/api/member/points-history/${userId}`);
  }
}
