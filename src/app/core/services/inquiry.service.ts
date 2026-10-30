import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SiteSettingService } from './site-setting.service';

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
  private readonly siteSettingService = inject(SiteSettingService);
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
   * Formats inquiry payload into a structured WhatsApp message.
   */
  formatInquiryWhatsappMessage(objPayload: InquiryPayload): string {
    if (
      objPayload.message &&
      objPayload.message.startsWith('Hello Royal Baku') &&
      !objPayload.message.toLowerCase().includes('enquiry submitted from home page')
    ) {
      return objPayload.message;
    }

    const lines: string[] = ['Hello Royal Baku, I would like to make a booking inquiry:'];

    if (objPayload.preferred_vehicle && objPayload.preferred_vehicle.toLowerCase() !== 'none') {
      lines.push(`• Vehicle: ${objPayload.preferred_vehicle}`);
    }
    if (objPayload.tour_package_title) {
      lines.push(`• Tour Package: ${objPayload.tour_package_title}`);
    }
    if (objPayload.pickup_date) {
      lines.push(`• Pickup Date: ${objPayload.pickup_date}`);
    }
    if (objPayload.dropoff_date) {
      lines.push(`• Return Date: ${objPayload.dropoff_date}`);
    }
    if (objPayload.name) {
      lines.push(`• Name: ${objPayload.name}`);
    }
    if (objPayload.phone) {
      lines.push(`• Phone: ${objPayload.phone}`);
    }
    if (objPayload.email) {
      lines.push(`• Email: ${objPayload.email}`);
    }
    if (objPayload.message && !objPayload.message.toLowerCase().includes('enquiry submitted from home page')) {
      lines.push(`• Notes: ${objPayload.message}`);
    }

    return lines.join('\n');
  }

  /**
   * Generates WhatsApp URL for an inquiry.
   */
  getInquiryWhatsappUrl(objPayload: InquiryPayload, rawWhatsappNumber?: string | null): string | null {
    const message = this.formatInquiryWhatsappMessage(objPayload);
    return (
      this.siteSettingService.getWhatsappUrl(rawWhatsappNumber, message) ||
      `https://wa.me/994512019191?text=${encodeURIComponent(message)}`
    );
  }

  /**
   * Passes the booking inquiry directly to WhatsApp instead of sending to backend.
   */
  submitInquiry(objPayload: InquiryPayload, rawWhatsappNumber?: string | null): Observable<InquiryResponse> {
    const urlWa = this.getInquiryWhatsappUrl(objPayload, rawWhatsappNumber);
    if (typeof window !== 'undefined' && urlWa) {
      window.open(urlWa, '_blank');
    }
    return of({
      message: 'Redirecting to WhatsApp to complete your request...',
      data: objPayload,
    });
  }
}
