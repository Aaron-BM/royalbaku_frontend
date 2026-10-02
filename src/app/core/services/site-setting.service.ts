import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SiteSettingData {
  id?: number;
  phone_number: string;
  whatsapp_number: string;
  address: any;
  email: string;
  social_links: any;
  working_hours: any;
}

export const DEFAULT_WHATSAPP_MESSAGE =
  'Hello, I am interested in renting a car. Could you please provide more details?';

export function normalizeWhatsappNumber(rawPhone?: string | null): string {
  if (!rawPhone || !rawPhone.trim()) return '';
  return rawPhone.replace(/\D/g, '');
}

export function normalizeTelNumber(rawPhone?: string | null): string {
  if (!rawPhone || !rawPhone.trim()) return '';
  return rawPhone.replace(/[^\d+]/g, '');
}

export function buildWhatsappUrl(rawPhone?: string | null, customMessage?: string): string | null {
  const cleanNumber = normalizeWhatsappNumber(rawPhone);
  if (!cleanNumber) return null;
  const msg = customMessage || DEFAULT_WHATSAPP_MESSAGE;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
}

export function buildTelUrl(rawPhone?: string | null): string | null {
  const cleanNumber = normalizeTelNumber(rawPhone);
  if (!cleanNumber) return null;
  return `tel:${cleanNumber}`;
}

@Injectable({
  providedIn: 'root',
})
export class SiteSettingService {
  private readonly http = inject(HttpClient);
  private readonly strApiBaseUrl = `${environment.apiBaseUrl}/site-settings`;

  private readonly defaultSettings: SiteSettingData = {
    phone_number: '',
    whatsapp_number: '',
    address: {},
    email: '',
    social_links: {},
    working_hours: {},
  };

  /** Reactive signal holding active settings across the app */
  public readonly objSiteSettingsSignal = signal<SiteSettingData>(this.defaultSettings);

  private settingsObservable$: Observable<SiteSettingData> | null = null;

  /**
   * Fetches active site settings from backend endpoint `/api/site-settings/current/`
   * Uses shareReplay(1) to cache the API request so multiple component subscriptions don't trigger duplicate HTTP calls.
   */
  getSiteSettings(): Observable<SiteSettingData> {
    if (!this.settingsObservable$) {
      this.settingsObservable$ = this.http
        .get<SiteSettingData>(`${this.strApiBaseUrl}/current/`)
        .pipe(
          tap((data) => {
            if (data) {
              this.objSiteSettingsSignal.set(data);
            }
          }),
          catchError((error) => {
            console.warn('Backend site-settings offline, falling back to defaults:', error);
            return of(this.defaultSettings);
          }),
          shareReplay(1)
        );
    }
    return this.settingsObservable$;
  }

  /**
   * Utility helper to get normalized WhatsApp URL from passed or cached settings
   */
  getWhatsappUrl(rawNumber?: string | null, customMessage?: string): string | null {
    const num = rawNumber || this.objSiteSettingsSignal().whatsapp_number;
    return buildWhatsappUrl(num, customMessage);
  }

  /**
   * Utility helper to get normalized Phone URL from passed or cached settings
   */
  getPhoneUrl(rawNumber?: string | null): string | null {
    const num = rawNumber || this.objSiteSettingsSignal().phone_number;
    return buildTelUrl(num);
  }
}
