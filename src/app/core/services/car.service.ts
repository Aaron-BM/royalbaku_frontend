import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CarCategoryMeta, CarDetailItem, PriceTableItem, CarCategory, CarBrand } from '../models/car.model';

export type CarDetailResult =
  | { status: 'ok'; car: CarDetailItem }
  | { status: 'notFound'; httpStatus: number }
  | { status: 'error'; httpStatus?: number; error?: unknown };
import {
  DRFCar,
  DRFBrand,
  DRFCategory,
  DRFPaginatedResponse,
  CatalogLookupResponse,
  mapDRFCarToCarDetailItem,
  mapDRFCarToPriceTableItem,
  mapDRFCategoryToItem,
  mapDRFBrandToItem,
} from '../utils/car-adapter';

@Injectable({
  providedIn: 'root',
})
export class CarService {
  private readonly http = inject(HttpClient);
  private readonly strApiBaseUrl = `${environment.apiBaseUrl}/cars`;
  private readonly strCategoriesApiUrl = `${environment.apiBaseUrl}/categories`;
  private readonly strBrandsApiUrl = `${environment.apiBaseUrl}/brands`;

  /**
   * Helper to normalize dynamic category route slugs
   */
  normalizeCategorySlug(strSlug?: string | null): string {
    if (!strSlug) return '';
    return strSlug
      .toLowerCase()
      .replace(/^rent-/, '')
      .replace(/-cars$/, '')
      .trim();
  }

  /**
   * Fetches lightweight lookup data for requested entities in a single HTTP request using /api/catalog-lookup/
   */
  getCatalogLookup(arrEntities: string[] = ['brand', 'category']): Observable<CatalogLookupResponse> {
    const strEntities = arrEntities.join(',');
    return this.http
      .get<CatalogLookupResponse>(`${environment.apiBaseUrl}/catalog-lookup/?entities=${strEntities}`)
      .pipe(catchError(() => of({})));
  }

  /**
   * Fetches active car categories directly from backend endpoint `/api/categories/`
   */
  getCategories(): Observable<CarCategory[]> {
    return this.http
      .get<DRFPaginatedResponse<DRFCategory> | DRFCategory[]>(`${this.strCategoriesApiUrl}/`)
      .pipe(
        map((res) => {
          const arrRaw: DRFCategory[] = Array.isArray(res)
            ? res
            : res && res.results
            ? res.results
            : [];
          return arrRaw.map(mapDRFCategoryToItem);
        }),
        catchError(() => of([]))
      );
  }

  /**
   * Fetches active car brands directly from backend endpoint `/api/brands/`
   */
  getBrands(): Observable<CarBrand[]> {
    return this.http
      .get<DRFPaginatedResponse<DRFBrand> | DRFBrand[]>(`${this.strBrandsApiUrl}/`)
      .pipe(
        map((res) => {
          const arrRaw: DRFBrand[] = Array.isArray(res)
            ? res
            : res && res.results
            ? res.results
            : [];
          return arrRaw.map(mapDRFBrandToItem);
        }),
        catchError(() => of([]))
      );
  }

  /**
   * Fetches all cars belonging to a specific brand ID or slug from backend endpoint `/api/cars/by-brand/?brand={id_or_slug}`
   */
  getCarsByBrand(strBrandIdOrSlug: string | number): Observable<CarDetailItem[]> {
    const strTarget = String(strBrandIdOrSlug);
    return this.http
      .get<DRFPaginatedResponse<DRFCar> | DRFCar[]>(
        `${this.strApiBaseUrl}/by-brand/?brand=${encodeURIComponent(strTarget)}`
      )
      .pipe(
        map((res) => {
          const arrRawCars: DRFCar[] = Array.isArray(res)
            ? res
            : res && res.results
            ? res.results
            : [];
          return arrRawCars.map((car) => mapDRFCarToCarDetailItem(car));
        }),
        catchError((error) => {
          console.warn(`Backend endpoint /api/cars/by-brand/?brand=${strTarget} error:`, error);
          return of([]);
        })
      );
  }

  /**
   * Fetches cars filtered by category or brand slug/ID from DRF backend endpoint
   */
  getCarsByCategoryOrBrand(strSlug?: string | null): Observable<CarDetailItem[]> {
    if (!strSlug) {
      return this.getAllCars();
    }

    const strNormalized = this.normalizeCategorySlug(strSlug);

    // First try querying by brand ID/slug
    return this.getCarsByBrand(strNormalized).pipe(
      switchMap((arrBrandCars) => {
        if (arrBrandCars && arrBrandCars.length > 0) {
          return of(arrBrandCars);
        }

        // If no cars found by brand, query by category
        let params = new HttpParams().set('category', strNormalized);
        return this.http
          .get<DRFPaginatedResponse<DRFCar> | DRFCar[]>(`${this.strApiBaseUrl}/`, { params })
          .pipe(
            map((res) => {
              const arrRawCars: DRFCar[] = Array.isArray(res)
                ? res
                : res && res.results
                ? res.results
                : [];
              return arrRawCars.map((car) => mapDRFCarToCarDetailItem(car));
            }),
            catchError(() => of([]))
          );
      })
    );
  }

  /**
   * Fetches data for the Rental Prices table page directly from `/api/cars/`
   */
  getRentalPrices(strBrandSlug?: string, strSortOrder?: string): Observable<PriceTableItem[]> {
    let params = new HttpParams();
    if (strBrandSlug && strBrandSlug !== 'all' && strBrandSlug !== '') {
      params = params.set('brand', strBrandSlug);
    }
    if (strSortOrder === 'low-to-high') {
      params = params.set('ordering', 'price_daily');
    } else if (strSortOrder === 'high-to-low') {
      params = params.set('ordering', '-price_daily');
    }

    return this.http
      .get<DRFPaginatedResponse<DRFCar> | DRFCar[]>(`${this.strApiBaseUrl}/`, { params })
      .pipe(
        map((res) => {
          const arrRawCars: DRFCar[] = Array.isArray(res)
            ? res
            : res && res.results
            ? res.results
            : [];
          return arrRawCars.map((car) => mapDRFCarToPriceTableItem(car));
        }),
        catchError(() => of([]))
      );
  }

  /**
   * Fetches a car detail item by its slug or ID directly from backend endpoint `/api/cars/{slug}/`
   */
  getCarBySlug(strSlug: string): Observable<CarDetailItem | null> {
    return this.http.get<DRFCar>(`${this.strApiBaseUrl}/${strSlug}/`).pipe(
      map((car) => mapDRFCarToCarDetailItem(car)),
      catchError(() => of(null))
    );
  }

  /**
   * Fetches car detail with typed status result (ok, notFound, error).
   * Includes an 8s timeout to prevent hanging SSR renders.
   */
  getCarBySlugResult(strSlug: string): Observable<CarDetailResult> {
    return this.http.get<DRFCar>(`${this.strApiBaseUrl}/${strSlug}/`).pipe(
      timeout(8000),
      map((car): CarDetailResult => ({
        status: 'ok',
        car: mapDRFCarToCarDetailItem(car),
      })),
      catchError((err: unknown): Observable<CarDetailResult> => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 404 || err.status === 410) {
            return of({ status: 'notFound', httpStatus: err.status });
          }
          return of({ status: 'error', httpStatus: err.status, error: err });
        }
        return of({ status: 'error', error: err });
      })
    );
  }

  /**
   * Fetches all cars list directly from backend `/api/cars/`
   */
  getAllCars(): Observable<CarDetailItem[]> {
    return this.http.get<DRFPaginatedResponse<DRFCar> | DRFCar[]>(`${this.strApiBaseUrl}/`).pipe(
      map((res) => {
        const arrRawCars: DRFCar[] = Array.isArray(res)
          ? res
          : res && res.results
          ? res.results
          : [];
        return arrRawCars.map((car) => mapDRFCarToCarDetailItem(car));
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Fetches active featured cars directly from backend endpoint `/api/cars/featured/`
   */
  getFeaturedCars(): Observable<CarDetailItem[]> {
    return this.http
      .get<DRFPaginatedResponse<DRFCar> | DRFCar[]>(`${this.strApiBaseUrl}/featured/`)
      .pipe(
        map((res) => {
          const arrRawCars: DRFCar[] = Array.isArray(res)
            ? res
            : res && res.results
            ? res.results
            : [];
          return arrRawCars.map((car) => mapDRFCarToCarDetailItem(car));
        }),
        catchError(() => of([]))
      );
  }

  /**
   * Fetches active special offer cars directly from backend endpoint `/api/cars/offers/`
   */
  getOfferCars(): Observable<CarDetailItem[]> {
    return this.http
      .get<DRFPaginatedResponse<DRFCar> | DRFCar[]>(`${this.strApiBaseUrl}/offers/`)
      .pipe(
        map((res) => {
          const arrRawCars: DRFCar[] = Array.isArray(res)
            ? res
            : res && res.results
            ? res.results
            : [];
          return arrRawCars.map((car) => mapDRFCarToCarDetailItem(car));
        }),
        catchError(() => of([]))
      );
  }
}
