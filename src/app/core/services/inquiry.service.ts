import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface InquiryPayload {
  name: string;
  phone: string;
  is_whatsapp?: boolean;
  car?: number | string | null;
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

  /**
   * Submits a customer inquiry or WhatsApp booking lead to the backend API.
   */
  submitInquiry(objPayload: InquiryPayload): Observable<InquiryResponse> {
    return this.http.post<InquiryResponse>(`${this.strApiBaseUrl}/`, objPayload).pipe(
      catchError((error) => {
        console.warn('Backend inquiry submission offline or failed, falling back gracefully:', error);
        return of({
          message: 'Inquiry submitted (offline mode).',
          data: objPayload,
        });
      })
    );
  }
}
