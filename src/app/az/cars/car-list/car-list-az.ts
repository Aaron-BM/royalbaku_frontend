import { Component, OnInit, DestroyRef, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { CarListHeroAz } from './components/hero/hero-az';
import { CarCard } from '../../../shared/components/car-card/car-card';
import { CarService } from '../../../core/services/car.service';
import { CarCategoryMeta, CarDetailItem } from '../../../core/models/car.model';

import { SeoService } from '../../../core/services/seo.service';
import { LanguageService } from '../../../core/services/language.service';
import { LangUrlPipe } from '../../../shared/pipes/lang-url.pipe';
import { DRFMinimalLookupItem, parseI18nString, parseMediaUrl } from '../../../core/utils/car-adapter';

export interface FilterOption {
  id: string;
  strNameKey: string;
  strSlug: string;
}

@Component({
  selector: 'app-car-list-az',
  standalone: true,
  imports: [RouterLink, TranslatePipe, CarListHeroAz, CarCard, LangUrlPipe],
  templateUrl: './car-list-az.html',
  styleUrl: './car-list-az.css',
})
export class CarListAz implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly carService = inject(CarService);
  private readonly svcSog = inject(SeoService);
  protected readonly svcLanguage = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly arrLookupCategories = signal<DRFMinimalLookupItem[]>([]);
  protected readonly arrLookupBrands = signal<DRFMinimalLookupItem[]>([]);

  protected readonly arrCars = signal<CarDetailItem[]>([]);
  protected readonly strCurrentCategorySlug = signal<string>('');
  
  // Filter dropdown state
  protected readonly blnShowBrandsDropdown = signal<boolean>(false);
  protected readonly blnShowTypesDropdown = signal<boolean>(false);

  // Dynamic filter dropdown options react to language changes and catalog lookup
  protected readonly arrTypeOptions = computed<FilterOption[]>(() => {
    const categories = this.arrLookupCategories();
    const currentLang = this.svcLanguage.strCurrentLang();
    if (categories.length === 0) return [];
    return [
      { id: 'type-all', strNameKey: 'hero.breadcrumbCategory', strSlug: '' },
      ...categories.map((c) => ({
        id: `type-${c.id}`,
        strNameKey: parseI18nString(c.name, currentLang),
        strSlug: c.slug,
      })),
    ];
  });

  protected readonly arrBrandOptions = computed<FilterOption[]>(() => {
    const brands = this.arrLookupBrands();
    const currentLang = this.svcLanguage.strCurrentLang();
    if (brands.length === 0) return [];
    return [
      { id: 'brand-all', strNameKey: 'cars.viewAllCars', strSlug: '' },
      ...brands.map((b) => ({
        id: `brand-${b.id}`,
        strNameKey: parseI18nString(b.name, currentLang),
        strSlug: b.slug,
      })),
    ];
  });

  // Reactive Category / Brand Metadata for hero banner
  protected readonly objCategoryMeta = computed<CarCategoryMeta | null>(() => {
    const rawSlug = this.strCurrentCategorySlug();
    if (!rawSlug) {
      return null;
    }

    const currentLang = this.svcLanguage.strCurrentLang();
    const normalizedSlug = this.carService.normalizeCategorySlug(rawSlug);

    const categories = this.arrLookupCategories();
    const brands = this.arrLookupBrands();

    const cat = categories.find(
      (c) => c.slug.toLowerCase() === rawSlug.toLowerCase() || c.slug.toLowerCase() === normalizedSlug.toLowerCase()
    );
    const brand = brands.find(
      (b) => b.slug.toLowerCase() === rawSlug.toLowerCase() || b.slug.toLowerCase() === normalizedSlug.toLowerCase()
    );

    // Resolution order on /cars/:category: check categories first, then brands.
    // If a slug ever exists in both lists, warn rather than silently picking one.
    if (cat && brand) {
      console.warn(
        `[CarList] Slug '${rawSlug}' exists in BOTH categories and brands! Prioritizing category.`
      );
    }

    if (cat) {
      const catName = parseI18nString(cat.name, currentLang) || cat.slug;
      const catDesc = parseI18nString(cat.description, currentLang) || '';
      return {
        strSlug: cat.slug,
        strTitle: catName,
        strDescription: catDesc,
        strActiveName: catName,
        strHeroBgImage: cat.image ? (parseMediaUrl(cat.image) || '') : '',
        blnIsBrand: false,
      };
    }

    if (brand) {
      const brandName = parseI18nString(brand.name, currentLang) || brand.slug;
      const brandDesc = parseI18nString(brand.description, currentLang) || '';
      return {
        strSlug: brand.slug,
        strTitle: brandName,
        strDescription: brandDesc,
        strActiveName: brandName,
        blnIsBrand: true,
      };
    }

    // Fallback while lookup is still loading or if slug not matched:
    const fallbackTitle = rawSlug
      .replace(/^rent-/, '')
      .replace(/-cars$/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      strSlug: rawSlug,
      strTitle: fallbackTitle,
      strDescription: '',
      strActiveName: fallbackTitle,
      blnIsBrand: false,
    };
  });

  constructor() {
    // Dynamic SEO updating reactively whenever route params, metadata, or language change
    effect(() => {
      const meta = this.objCategoryMeta();
      const rawSlug = this.strCurrentCategorySlug();
      const isAz = this.svcLanguage.strCurrentLang() === 'az';

      if (!rawSlug) {
        // All Cars default view
        this.svcSog.fnSetSeo({
          title: isAz
            ? 'Bütün Avtomobillər | Royal Baku Rent A Car'
            : 'All Cars Rental Baku | Royal Baku Car Rental',
          description: isAz
            ? 'Ekonom və SUV modellərindən tutmuş lüks və idman avtomobillərinə qədər geniş avtomobil çeşidimizi kəşf edin. Büdcənizə və səyahət ehtiyaclarınıza uyğun ideal avtomobili çevik gündəlik, həftəlik və aylıq icarə seçimləri ilə seçin.'
            : 'Explore a wide range of vehicles, from economy and SUVs to luxury and sports cars. Choose the perfect car based on your budget and travel needs, with flexible daily, weekly, and monthly rental options.',
        });
      } else if (meta) {
        const titleName = meta.strTitle || meta.strSlug;
        const descText =
          meta.strDescription ||
          (isAz
            ? `Bakıda ${titleName} icarəsi. Sabit 100$ geri qaytarılan depozit və 24/7 sürətli çatdırılma.`
            : `Rent ${titleName} in Baku with transparent terms, $100 refundable deposit, and 24/7 fast delivery across Azerbaijan.`);

        this.svcSog.fnSetSeo({
          title: isAz
            ? `${titleName} İcarəsi Bakı | Royal Baku Rent A Car`
            : `${titleName} Rental Baku | Royal Baku Car Rental`,
          description: descText,
        });
      }
    });
  }

  ngOnInit(): void {
    // Load category and brand lookup dynamically from DRF backend via single catalog-lookup API
    this.carService.getCatalogLookup(['category', 'brand']).subscribe((lookup) => {
      if (lookup.categories && lookup.categories.length > 0) {
        this.arrLookupCategories.set(lookup.categories);
      }
      if (lookup.brands && lookup.brands.length > 0) {
        this.arrLookupBrands.set(lookup.brands);
      }
    });

    // Dynamically react to route changes (e.g. /cars, /cars/suv, /cars/mercedes-benz)
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
      }
      const strCategoryParam = params['category'] || '';
      this.strCurrentCategorySlug.set(strCategoryParam);

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
