import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CountryCode {
  code: string;
  name: string;
  dial_code: string;
  flag: string;
}

export interface InquiryPayload {
  type?: 'car' | 'tour' | 'normal';
  name: string;
  phone: string;
  country_code?: string;
  phone_number?: string;
  email?: string;
  is_whatsapp?: boolean;
  car?: number | string | null;
  tour_package?: number | string | null;
  tour_package_title?: string;
  preferred_vehicle?: string;
  pickup_date?: string;
  dropoff_date?: string;
  message?: string;
}

export interface InquiryResponse {
  message: string;
  data: any;
}

@Injectable({
  providedIn: 'root',
})
export class InquiryService {
  private readonly http = inject(HttpClient);
  private readonly strApiBaseUrl = `${environment.apiBaseUrl}/inquiries`;
  private readonly strContactApiUrl = `${environment.apiBaseUrl}/contact`;
  private readonly strCountryCodesApiUrl = `${environment.apiBaseUrl}/country-codes`;

  /**
   * Fetches country codes list dynamically from backend API `/api/country-codes/`
   */
  getCountryCodes(): Observable<CountryCode[]> {
    return this.http.get<CountryCode[]>(`${this.strCountryCodesApiUrl}/`).pipe(
      catchError(() =>
        of([
          { code: 'AZ', name: 'Azerbaijan', dial_code: '+994', flag: '🇦🇿' },
          { code: 'AE', name: 'United Arab Emirates', dial_code: '+971', flag: '🇦🇪' },
          { code: 'SA', name: 'Saudi Arabia', dial_code: '+966', flag: '🇸🇦' },
          { code: 'QA', name: 'Qatar', dial_code: '+974', flag: '🇶🇦' },
          { code: 'KW', name: 'Kuwait', dial_code: '+965', flag: '🇰🇼' },
          { code: 'BH', name: 'Bahrain', dial_code: '+973', flag: '🇧🇭' },
          { code: 'OM', name: 'Oman', dial_code: '+968', flag: '🇴🇲' },
          { code: 'TR', name: 'Turkey', dial_code: '+90', flag: '🇹🇷' },
          { code: 'RU', name: 'Russia', dial_code: '+7', flag: '🇷🇺' },
          { code: 'US', name: 'United States', dial_code: '+1', flag: '🇺🇸' },
          { code: 'GB', name: 'United Kingdom', dial_code: '+44', flag: '🇬🇧' },
          { code: 'DE', name: 'Germany', dial_code: '+49', flag: '🇩🇪' },
        ])
      )
    );
  }

  /**
   * Submits a customer inquiry to the backend API `/api/inquiries/`.
   */
  submitInquiry(objPayload: InquiryPayload): Observable<InquiryResponse> {
    return this.http.post<InquiryResponse>(`${this.strApiBaseUrl}/`, objPayload);
  }
}

