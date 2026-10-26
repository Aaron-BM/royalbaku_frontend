import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NgClass } from '@angular/common';
import { CarService } from '../../../core/services/car.service';
import { PriceTableItem, CarBrand } from '../../../core/models/car.model';

import { SeoService } from '../../../core/services/seo.service';
import { LanguageService } from '../../../core/services/language.service';
import { LangUrlPipe } from '../../../shared/pipes/lang-url.pipe';

import { AppCurrencyPipe } from '../../../shared/pipes/app-currency.pipe';

@Component({
  selector: 'app-prices-az',
  standalone: true,
  imports: [RouterLink, TranslatePipe, NgClass, AppCurrencyPipe, LangUrlPipe],
  templateUrl: './prices-az.html',
  styleUrl: './prices-az.css',
})
export class PricesAz implements OnInit {
  private readonly carService = inject(CarService);
  private readonly svcSog = inject(SeoService);
  private readonly svcLanguage = inject(LanguageService);

  protected readonly arrBrands = signal<CarBrand[]>([]);
  protected readonly arrPrices = signal<PriceTableItem[]>([]);
  protected readonly strSelectedBrand = signal<string>('all');
  protected readonly strSelectedSort = signal<string>('default');
  protected readonly strSearchQuery = signal<string>('');
  protected readonly blnLoading = signal<boolean>(true);
  protected readonly strViewMode = signal<'table' | 'grid'>('table');

  /**
   * Computed list filtering by client-side search input keyword
   */
  protected readonly arrFilteredPrices = computed(() => {
    const strQuery = this.strSearchQuery().toLowerCase().trim();
    const arrList = this.arrPrices();
    if (!strQuery) return arrList;

    return arrList.filter(
      (item) =>
        (item.strCarName && item.strCarName.toLowerCase().includes(strQuery)) ||
        (item.strBrandSlug && item.strBrandSlug.toLowerCase().includes(strQuery)) ||
        (item.strBrandName && item.strBrandName.toLowerCase().includes(strQuery)) ||
        (item.strCategoryName && item.strCategoryName.toLowerCase().includes(strQuery))
    );
  });


  ngOnInit(): void {
    const isAz = this.svcLanguage.strCurrentLang() === 'az';
    this.svcSog.fnSetSeo({
      title: isAz
        ? 'Avtomobil İcarəsi Qiymətləri | Royal Baku Rent A Car'
        : 'Car Rental Prices in Baku | Royal Baku Car Rental',
      description: isAz
        ? 'Bakıda lüks, SUV və ekonom avtomobillərin şفاف icarə qiymətləri siyahısı. Depozitsiz, gündəlik, həftəlik və aylıq qiymətlər.'
        : 'Transparent car rental prices in Baku, Azerbaijan. Compare daily, weekly, and monthly rates for luxury, SUV, and economy cars with zero deposit options.',
    });

    this.fnLoadBrands();
    this.fnLoadPrices();
  }

  protected fnLoadBrands(): void {
    this.carService.getBrands().subscribe({
      next: (arrData) => this.arrBrands.set(arrData),
      error: (err) => console.warn('Error fetching brands:', err),
    });
  }

  protected fnLoadPrices(): void {
    this.blnLoading.set(true);
    this.carService
      .getRentalPrices(this.strSelectedBrand(), this.strSelectedSort())
      .subscribe({
        next: (arrData) => {
          this.arrPrices.set(arrData);
          this.blnLoading.set(false);
        },
        error: (err) => {
          console.warn('Error fetching rental prices:', err);
          this.blnLoading.set(false);
        },
      });
  }

  protected onBrandChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.strSelectedBrand.set(target.value);
    this.fnLoadPrices();
  }

  protected onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.strSelectedSort.set(target.value);
    this.fnLoadPrices();
  }

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.strSearchQuery.set(target.value);
  }

  protected fnApplyFilter(): void {
    this.fnLoadPrices();
  }

  protected fnResetFilters(): void {
    this.strSelectedBrand.set('all');
    this.strSelectedSort.set('default');
    this.strSearchQuery.set('');
    this.fnLoadPrices();
  }

  protected fnSetViewMode(mode: 'table' | 'grid'): void {
    this.strViewMode.set(mode);
  }
}
