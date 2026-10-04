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
  arrCarPrices: { strCarName: string; numDailyPrice?: number; strPrice?: string }[];
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
   * Fetches price category groups for home price grid.
   */
  getPriceCategories(): Observable<PriceCategoryGroup[]> {
    return this.http.get<PriceCategoryGroup[]>(`${this.strApiBaseUrl}/price-categories/`).pipe(
      catchError(() => of([]))
    );
  }
}
