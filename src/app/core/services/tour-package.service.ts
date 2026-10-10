import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TourPackage, TourPackageApi, TourPackageStopApi, TourStop } from '../models/tour-package.model';

@Injectable({
  providedIn: 'root',
})
export class TourPackageService {
  private readonly http = inject(HttpClient);
  private readonly strApiUrl = `${environment.apiBaseUrl}/tour-packages`;

  /**
   * Helper to parse i18n string or JSON dict
   */
  private resolveI18nString(val?: string | Record<string, string>, strLang = 'en'): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[strLang] || val['en'] || Object.values(val)[0] || '';
  }

  /**
   * Helper to build clean image URL for stops
   */
  private resolveImageUrl(rawUrl?: string | null): string {
    if (!rawUrl) return '/assets/images/tours/stops/highland-park.png';
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return rawUrl;
    if (rawUrl.startsWith('/media/')) {
      const strBase = environment.apiBaseUrl.replace(/\/api\/?$/, '');
      return `${strBase}${rawUrl}`;
    }
    return rawUrl;
  }

  private parseNumericPriceUsd(item: TourPackageApi): number | undefined {
    if (typeof item.price_usd === 'number' && !isNaN(item.price_usd)) {
      return item.price_usd;
    }
    if (item.price && typeof item.price === 'string') {
      const cleaned = item.price.replace(/[^0-9.]/g, '');
      const numVal = parseFloat(cleaned);
      if (!isNaN(numVal)) {
        return numVal;
      }
    }
    if (typeof item.price === 'number' && !isNaN(item.price as any)) {
      return item.price;
    }
    if (typeof window !== 'undefined') {
      console.warn('[TourPackageService] Failed to parse numeric USD price for tour package:', item.title || item.slug, item.price);
    }
    return undefined;
  }

  /**
   * Maps DRF API response to TourPackage interface
   */
  private mapApiToTourPackage(item: TourPackageApi): TourPackage {
    const stops: TourStop[] = (item.stops || [])
      .sort((a, b) => a.order - b.order)
      .map((s: TourPackageStopApi) => ({
        order: s.order,
        name: this.resolveI18nString(s.name),
        description: this.resolveI18nString(s.description),
        image: this.resolveImageUrl(s.image),
      }));

    return {
      id: item.slug || String(item.id),
      slug: item.slug || String(item.id),
      title: this.resolveI18nString(item.title) || 'CITY TOUR PACKAGE',
      subtitle: item.subtitle || '',
      tagline: this.resolveI18nString(item.tagline),
      transfersIncluded: item.transfersIncluded ?? item.transfers_included ?? true,
      whatsapp: item.whatsapp || '',
      phone: item.phone || '',
      website: item.website || 'www.royalbakucarrental.com',
      price: item.price || '$600',
      priceUsd: this.parseNumericPriceUsd(item),
      stops,
    };
  }

  /**
   * Fetches all active tour packages from API endpoint `/api/tour-packages/`
   */
  getAllPackages(): Observable<TourPackage[]> {
    return this.http.get<TourPackageApi[] | { results: TourPackageApi[] }>(`${this.strApiUrl}/`).pipe(
      map((res) => {
        const arrRaw = Array.isArray(res) ? res : res?.results || [];
        return arrRaw.map((pkg) => this.mapApiToTourPackage(pkg));
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Alias for getTourPackages matching requirements
   */
  getTourPackages(): Observable<TourPackage[]> {
    return this.getAllPackages();
  }

  /**
   * Fetches single tour package by slug from API endpoint `/api/tour-packages/{slug}/`
   */
  getPackageBySlug(slug: string): Observable<TourPackage | null> {
    return this.http.get<TourPackageApi>(`${this.strApiUrl}/${slug}/`).pipe(
      map((res) => this.mapApiToTourPackage(res)),
      catchError(() => of(null))
    );
  }
}
