import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface LatestOfferItem {
  strTitleKey: string;
  strDescKey: string;
}

export interface PriceCategoryGroup {
  strCategoryTitleKey: string;
  strCategoryDescKey: string;
  arrCarPrices: { strCarName: string; strPrice: string }[];
}

export interface RentalTipItem {
  strTitleKey: string;
  strDescKey: string;
}

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private readonly http = inject(HttpClient);
  private readonly strApiBaseUrl = `${environment.apiBaseUrl}/home`;

  /**
   * Fetches latest offers list for home section.
   */
  // getLatestOffers(): Observable<LatestOfferItem[]> {
  //   return this.http.get<LatestOfferItem[]>(`${this.strApiBaseUrl}/latest-offers/`).pipe(
  //     catchError(() => of([]))
  //   );
  // }

  /**
   * Fetches price category groups for home price grid.
   */
  getPriceCategories(): Observable<PriceCategoryGroup[]> {
    return this.http.get<PriceCategoryGroup[]>(`${this.strApiBaseUrl}/price-categories/`).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Fetches tips for renting luxury car list.
   */
  // getRentalTips(): Observable<{ col1: RentalTipItem[]; col2: RentalTipItem[] }> {
  //   return this.http.get<{ col1: RentalTipItem[]; col2: RentalTipItem[] }>(`${this.strApiBaseUrl}/tips/`).pipe(
  //     catchError(() => of({ col1: [], col2: [] }))
  //   );
  // }
}
