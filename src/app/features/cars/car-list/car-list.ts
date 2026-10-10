import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { CarListHero } from './components/hero/hero';
import { CarCard } from '../../../shared/components/car-card/car-card';
import { CarService } from '../../../core/services/car.service';
import { CarCategoryMeta, CarDetailItem } from '../../../core/models/car.model';

import { SeoService } from '../../../core/services/seo.service';
import { LanguageService } from '../../../core/services/language.service';
import { LangUrlPipe } from '../../../shared/pipes/lang-url.pipe';
import { parseI18nString } from '../../../core/utils/car-adapter';

export interface FilterOption {
  id: string;
  strNameKey: string;
  strSlug: string;
}

@Component({
  selector: 'app-car-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, CarListHero, CarCard, LangUrlPipe],
  templateUrl: './car-list.html',
  styleUrl: './car-list.css',
})
export class CarList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly carService = inject(CarService);
  private readonly svcSog = inject(SeoService);
  protected readonly svcLanguage = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly objCategoryMeta = signal<CarCategoryMeta | null>(null);
  protected readonly arrCars = signal<CarDetailItem[]>([]);
  protected readonly strCurrentCategorySlug = signal<string>('');
  
  // Filter dropdown state
  protected readonly blnShowBrandsDropdown = signal<boolean>(false);
  protected readonly blnShowTypesDropdown = signal<boolean>(false);

  protected readonly arrTypeOptions = signal<FilterOption[]>([]);
  protected readonly arrBrandOptions = signal<FilterOption[]>([]);

  ngOnInit(): void {
    // Load category and brand options dynamically from DRF backend via single lookup API
    this.carService.getCatalogLookup(['category', 'brand']).subscribe((lookup) => {
      if (lookup.categories && lookup.categories.length > 0) {
        const options: FilterOption[] = [
          { id: 'type-all', strNameKey: 'hero.breadcrumbCategory', strSlug: '' },
          ...lookup.categories.map((c) => ({
            id: `type-${c.id}`,
            strNameKey: parseI18nString(c.name),
            strSlug: c.slug,
          })),
        ];
        this.arrTypeOptions.set(options);
      }

      if (lookup.brands && lookup.brands.length > 0) {
        const options: FilterOption[] = [
          { id: 'brand-all', strNameKey: 'cars.viewAllCars', strSlug: '' },
          ...lookup.brands.map((b) => ({
            id: `brand-${b.id}`,
            strNameKey: parseI18nString(b.name),
            strSlug: b.slug,
          })),
        ];
        this.arrBrandOptions.set(options);
      }
    });

    // Dynamically react to route changes (e.g. /cars, /cars/rent-luxury-cars, /cars/rent-sports-cars)
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
      }
      const strCategoryParam = params['category'] || '';
      this.strCurrentCategorySlug.set(strCategoryParam);

      // Resolve metadata for hero banner
      const meta = this.carService.getCategoryMetadata(strCategoryParam);
      this.objCategoryMeta.set(meta);

      const isAz = this.svcLanguage.strCurrentLang() === 'az';
      const catTitle = strCategoryParam ? strCategoryParam.replace(/-/g, ' ').toUpperCase() : 'All Cars';
      this.svcSog.fnSetSeo({
        title: isAz
          ? `${catTitle} İcarəsi Bakı | Royal Baku Rent A Car`
          : `${catTitle} Rental Baku | Royal Baku Car Rental`,
        description: isAz
          ? `Bakıda ${catTitle} icarəsi. Depozitsiz ən yaxşı avtomobillər və 24/7 pulsuz çatdırılma.`
          : `Rent ${catTitle} in Baku with zero deposit options and 24/7 fast delivery across Azerbaijan.`,
      });

      // Fetch filtered dataset directly from backend API
      this.carService
        .getCarsByCategoryOrBrand(strCategoryParam)
        .subscribe((cars) => this.arrCars.set(cars));
    });
  }

  protected toggleBrandsDropdown(): void {
    this.blnShowBrandsDropdown.update((val) => !val);
    this.blnShowTypesDropdown.set(false);
  }

  protected toggleTypesDropdown(): void {
    this.blnShowTypesDropdown.update((val) => !val);
    this.blnShowBrandsDropdown.set(false);
  }

  protected selectType(strSlug: string): void {
    this.blnShowTypesDropdown.set(false);
    this.router.navigate(this.svcLanguage.fnLangRoute(strSlug ? ['/cars', strSlug] : ['/cars']));
  }

  protected selectBrand(strSlug: string): void {
    this.blnShowBrandsDropdown.set(false);
    this.router.navigate(this.svcLanguage.fnLangRoute(strSlug ? ['/cars', strSlug] : ['/cars']));
  }
}
