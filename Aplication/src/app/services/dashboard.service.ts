import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

/* ================= INTERFACES ================= */

export interface DashboardMetrics {
  transactions: number;
  revenue: number;
  products: number;
  members: number;
}

export interface BestProduct {
  product_name: string;
  total_sold: number;
  price: number;
}

export interface RecentTransaction {
  id: number;
  invoice_code: string;
  total_price: number;
  payment_method: 'cash' | 'qris' | 'transfer';
  created_at: string;
}

interface ApiResponse<T> {
  status: boolean;
  data: T;
}

/* ================= SERVICE ================= */

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private api = environment.apiBaseUrl + '/api/dashboard';

  constructor(private http: HttpClient) {}

  // ===== METRICS =====
  getMetrics(): Observable<ApiResponse<DashboardMetrics>> {
    return this.http.get<ApiResponse<DashboardMetrics>>(
      `${this.api}/metrics`
    );
  }

  // ===== WEEKLY CHART =====
  getWeeklyChart(): Observable<ApiResponse<number[]>> {
    return this.http.get<ApiResponse<number[]>>(
      `${this.api}/chart`
    );
  }

  // ===== BEST PRODUCTS =====
  getBestProducts(): Observable<ApiResponse<BestProduct[]>> {
    return this.http.get<ApiResponse<BestProduct[]>>(
      `${this.api}/best-products`
    );
  }

  // ===== RECENT TRANSACTIONS =====
  getRecentTransactions(): Observable<ApiResponse<RecentTransaction[]>> {
    return this.http.get<ApiResponse<RecentTransaction[]>>(
      `${this.api}/recent-transactions`
    );
  }
}
