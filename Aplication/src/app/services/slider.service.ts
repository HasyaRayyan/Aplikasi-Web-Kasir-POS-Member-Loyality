import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface Slider {
  id?: number;
  title: string;
  image: string;
  is_active: number | boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SliderService {
  private apiUrl = `${environment.apiBaseUrl}/api/banners`;

  constructor(private http: HttpClient) {}

  getSliders(search: string = ''): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?search=${search}`);
  }

  createSlider(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  updateSlider(id: number, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/update/${id}`, formData);
  }

  deleteSlider(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/delete/${id}`, {});
  }

  toggleStatus(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/toggle/${id}`, {});
  }
}
