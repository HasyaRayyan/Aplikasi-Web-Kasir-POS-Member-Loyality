import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class KasirService {

  constructor(private http: HttpClient) {}

  findMember(phone: string) {
    return this.http.get<any>(
      `${environment.apiBaseUrl}/api/getmemberbyphone?phone=${phone}`
    );
  }

  createTransaction(data: any) {
    return this.http.post(`${environment.apiBaseUrl}/api/transaction`, data);
  }

  getActivePointRule() {
    return this.http.get<any>(
      `${environment.apiBaseUrl}/api/point-rule-active`
    )
  }


  getHistory(page:number, search:string) {
    return this.http.get<any>(
      `${environment.apiBaseUrl}/api/history?page=${page}&search=${search}`
    );
  }

  claimRedemption(id: number) {
    return this.http.post<any>(`${environment.apiBaseUrl}/api/kasir/claim/${id}`, {});
  }


}
