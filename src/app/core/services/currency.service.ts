import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type CurrencyCode = 'USD' | 'AZN';

export interface CurrencyRatesResponse {
  base: string;
  rates: {
    AZN: number;
    [key: string]: number;
  };
  updated_at?: string;
}

const LOCAL_STORAGE_KEY = 'royalbaku_currency';
const DEFAULT_FALLBACK_AZN_RATE = 1.7;

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  public readonly strCurrentCurrency = signal<CurrencyCode>('USD');
  public readonly numUsdToAznRate = signal<number>(DEFAULT_FALLBACK_AZN_RATE);
  public readonly blnIsLoading = signal<boolean>(false);

  constructor() {
    this.fnInitCurrencyState();
    this.fnFetchExchangeRates();
  }

  private fnInitCurrencyState(): void {
    if (isPlatformBrowser(this.platformId)) {
      const strSavedCurrency = localStorage.getItem(LOCAL_STORAGE_KEY) as CurrencyCode | null;
      if (strSavedCurrency && (strSavedCurrency === 'USD' || strSavedCurrency === 'AZN')) {
        this.strCurrentCurrency.set(strSavedCurrency);
      } else {
        this.strCurrentCurrency.set('USD');
      }
    }
  }

  public fnFetchExchangeRates(): void {
    this.blnIsLoading.set(true);
    const strApiUrl = `${environment.apiBaseUrl}/currency/rates/`;

    this.http.get<CurrencyRatesResponse>(strApiUrl).subscribe({
      next: (res) => {
        if (res && res.rates && res.rates.AZN) {
          this.numUsdToAznRate.set(res.rates.AZN);
        }
        this.blnIsLoading.set(false);
      },
      error: (err) => {
        this.blnIsLoading.set(false);
      },
    });
  }

  public fnSetCurrency(strCode: CurrencyCode): void {
    if (strCode === this.strCurrentCurrency()) return;

    this.strCurrentCurrency.set(strCode);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, strCode);
    }
  }

  /**
   * Converts a USD base price to the active currency.
   */
  public convertPrice(numUsdPrice: number, targetCurrency?: CurrencyCode): number {
    if (numUsdPrice == null || isNaN(numUsdPrice)) return 0;
    const currency = targetCurrency || this.strCurrentCurrency();

    if (currency === 'AZN') {
      return Math.round(numUsdPrice * this.numUsdToAznRate());
    }

    return Math.round(numUsdPrice);
  }

  /**
   * Formats a USD base price into formatted string with appropriate symbol/code.
   * USD format: $100
   * AZN format: 170 ₼ (or 170 AZN)
   */
  public formatPrice(numUsdPrice: number | undefined | null, targetCurrency?: CurrencyCode): string {
    if (numUsdPrice == null || isNaN(numUsdPrice)) return '';
    const currency = targetCurrency || this.strCurrentCurrency();
    const converted = this.convertPrice(numUsdPrice, currency);

    if (currency === 'AZN') {
      return `${converted.toLocaleString()} ₼`;
    }

    return `$${converted.toLocaleString()}`;
  }
}
