import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService, CurrencyCode } from '../../core/services/currency.service';

@Pipe({
  name: 'appCurrency',
  standalone: true,
  pure: false,
})
export class AppCurrencyPipe implements PipeTransform {
  private readonly currencyService = inject(CurrencyService);

  transform(numUsdPrice: number | string | null | undefined, targetCurrency?: CurrencyCode): string {
    if (numUsdPrice == null || numUsdPrice === '') return '';

    const numValue = typeof numUsdPrice === 'string' ? parseFloat(numUsdPrice) : numUsdPrice;
    if (isNaN(numValue)) return String(numUsdPrice);

    return this.currencyService.formatPrice(numValue, targetCurrency);
  }
}
