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
}
