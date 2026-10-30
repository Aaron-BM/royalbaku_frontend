import { Component, OnInit, AfterViewInit, OnDestroy, inject, signal, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { CarCard } from '../../shared/components/car-card/car-card';
import { CarItem } from '../../core/models/car.model';
import { HomeService, LatestOfferItem, PriceCategoryGroup, RentalTipItem } from './services/home.service';
import { CarService } from '../../core/services/car.service';
import { SeoService } from '../../core/services/seo.service';
import { LanguageService } from '../../core/services/language.service';
import { LangUrlPipe } from '../../shared/pipes/lang-url.pipe';

import { SiteSettingService } from '../../core/services/site-setting.service';
import { TourPackageService } from '../../core/services/tour-package.service';
import { TourPackage } from '../../core/models/tour-package.model';

export interface HomeBrand {
  strId: string;
  strName: string;
  strSlug: string;
  strLogo?: string;
}

export interface HomeSocialItem {
  idSocial: string;
  strName: string;
  strHandle?: string;
  strUrl: string;
  strIcon: string;
}

export interface HomeFeature {
  strId: string;
  strTitleKey: string;
  strDescKey: string;
  strIcon: 'car' | 'card' | 'receipt' | 'shield' | 'headset' | 'star' | 'wallet' | 'refresh';
}

export interface HomeCategory {
  strId: string;
  strNameKey: string;
  strSlug: string;
  strImagePath: string;
}

import { EnquiryBar } from './components/enquiry-bar/enquiry-bar';
import { AppCurrencyPipe } from '../../shared/pipes/app-currency.pipe';
import { IconWhatsappComponent } from '../../shared/components/icons/icon-whatsapp';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TranslatePipe, CarCard, EnquiryBar, AppCurrencyPipe, IconWhatsappComponent, LangUrlPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  private readonly homeService = inject(HomeService);
  private readonly carService = inject(CarService);
  private readonly siteSettingService = inject(SiteSettingService);
  private readonly tourPackageService = inject(TourPackageService);
  private readonly svcSog = inject(SeoService);
  private readonly svcLanguage = inject(LanguageService);
  private readonly elementRef = inject(ElementRef);

  // Rotating Hero Title Phrases & State
  protected readonly arrHeroPhrases = [
    'home.heroRotating.style',
    'home.heroRotating.rentals',
    'home.heroRotating.tours',
    'home.heroRotating.drives',
    'home.heroRotating.limits',
  ];
  protected readonly numCurrentPhraseIndex = signal<number>(0);
  protected readonly numExitingPhraseIndex = signal<number | null>(null);
  private timerHandle: any = null;
  private visibilityListener: (() => void) | null = null;

  // Home Service Signal State (Backend API driven)
  protected readonly arrLatestOffers = signal<LatestOfferItem[]>([]);
  protected readonly arrPriceCategories = signal<PriceCategoryGroup[]>([]);
  protected readonly objRentalTips = signal<{ col1: RentalTipItem[]; col2: RentalTipItem[] }>({
    col1: [],
    col2: [],
  });

  // Featured Cars & Promotional Offers Signals (Backend API driven)
  protected readonly arrLuxuryCars = signal<CarItem[]>([]);
  protected readonly arrDailyOfferCars = signal<CarItem[]>([]);

  // Tour Packages Signals (Backend API driven)
  protected readonly arrTourPackages = signal<TourPackage[]>([]);
  protected readonly numTotalTourPackages = signal<number>(0);

  // Brand Marquee Signal (Backend API driven - zero hardcoded data)
  protected readonly arrBrands = signal<HomeBrand[]>([]);

  // Car Categories Signal (Backend API driven)
  protected readonly arrCategories = signal<HomeCategory[]>([]);

  // Active FAQ toggled ID signal
  protected readonly strOpenFaqId = signal<string | null>(null);

  protected toggleFaq(strId: string): void {
    this.strOpenFaqId.update((current) => (current === strId ? null : strId));
  }

  // Steps for timeline workflow
  protected readonly arrRentalSteps = signal<{ strNumber: string; strTitleKey: string; strDescKey: string; strPosition: string; strIcon: string }[]>([
    { strNumber: '01', strTitleKey: 'home.stepProcess.step1Title', strDescKey: 'home.stepProcess.step1Desc', strPosition: 'left', strIcon: 'car' },
    { strNumber: '02', strTitleKey: 'home.stepProcess.step2Title', strDescKey: 'home.stepProcess.step2Desc', strPosition: 'right', strIcon: 'whatsapp' },
    { strNumber: '03', strTitleKey: 'home.stepProcess.step3Title', strDescKey: 'home.stepProcess.step3Desc', strPosition: 'left', strIcon: 'confirm' },
    { strNumber: '04', strTitleKey: 'home.stepProcess.step4Title', strDescKey: 'home.stepProcess.step4Desc', strPosition: 'right', strIcon: 'key' },
  ]);

  // Why Choose Us Value Proposition Features
  protected readonly arrWhyUsFeatures = [
    { strId: 'f1', strIcon: 'headset', strTitleKey: 'home.whyUs.f1Title', strDescKey: 'home.whyUs.f1Desc' },
    { strId: 'f2', strIcon: 'shield', strTitleKey: 'home.whyUs.f2Title', strDescKey: 'home.whyUs.f2Desc' },
    { strId: 'f3', strIcon: 'plane', strTitleKey: 'home.whyUs.f3Title', strDescKey: 'home.whyUs.f3Desc' },
    { strId: 'f4', strIcon: 'crown', strTitleKey: 'home.whyUs.f4Title', strDescKey: 'home.whyUs.f4Desc' },
    { strId: 'f5', strIcon: 'clock', strTitleKey: 'home.whyUs.f5Title', strDescKey: 'home.whyUs.f5Desc' },
    { strId: 'f6', strIcon: 'map-pin', strTitleKey: 'home.whyUs.f6Title', strDescKey: 'home.whyUs.f6Desc' },
  ];

  // Reviews Data
  protected readonly arrReviews = signal<{ strNameKey: string; strTagKey: string; strTextKey: string; strInitial: string; strColor: string }[]>([
    { strNameKey: 'home.reviews.review1Name', strTagKey: 'home.reviews.review1Tag', strTextKey: 'home.reviews.review1Text', strInitial: 'K', strColor: 'bg-emerald-600' },
    { strNameKey: 'home.reviews.review2Name', strTagKey: 'home.reviews.review2Tag', strTextKey: 'home.reviews.review2Text', strInitial: 'E', strColor: 'bg-blue-600' },
    { strNameKey: 'home.reviews.review3Name', strTagKey: 'home.reviews.review3Tag', strTextKey: 'home.reviews.review3Text', strInitial: 'Y', strColor: 'bg-amber-600' },
    { strNameKey: 'home.reviews.review4Name', strTagKey: 'home.reviews.review4Tag', strTextKey: 'home.reviews.review4Text', strInitial: 'M', strColor: 'bg-purple-600' },
  ]);

  // Dynamic Social Links (Backend API driven)
  protected readonly arrSocialLinks = signal<HomeSocialItem[]>([]);

  // FAQ Column 1 & Column 2 Groups (6 Top Essential Questions)
  protected readonly arrFaqColumn1 = signal<{ strTitleKey: string; arrQuestions: { strId: string; strQuestionKey: string; strAnswerKey: string }[] }[]>([
    {
      strTitleKey: 'home.faq.bookingGroup',
      arrQuestions: [
        { strId: 'q5', strQuestionKey: 'home.faq.q5', strAnswerKey: 'home.faq.a5' },
        { strId: 'q9', strQuestionKey: 'home.faq.q9', strAnswerKey: 'home.faq.a9' },
        { strId: 'q1', strQuestionKey: 'home.faq.q1', strAnswerKey: 'home.faq.a1' },
      ],
    },
  ]);

  protected readonly arrFaqColumn2 = signal<{ strTitleKey: string; arrQuestions: { strId: string; strQuestionKey: string; strAnswerKey: string }[] }[]>([
    {
      strTitleKey: 'home.faq.drivingGroup',
      arrQuestions: [
        { strId: 'q10', strQuestionKey: 'home.faq.q10', strAnswerKey: 'home.faq.a10' },
        { strId: 'q13', strQuestionKey: 'home.faq.q13', strAnswerKey: 'home.faq.a13' },
        { strId: 'q7', strQuestionKey: 'home.faq.q7', strAnswerKey: 'home.faq.a7' },
      ],
    },
  ]);

  ngOnInit(): void {
    const isAz = this.svcLanguage.strCurrentLang() === 'az';
    this.svcSog.fnSetSeo({
      title: isAz
        ? 'Royal Baku Rent A Car | Bakıda Lüks və Ekonom Avtomobil İcarəsi'
        : 'Royal Baku Rent A Car | Premium & Economy Car Rental in Baku',
      description: isAz
        ? 'Bakıda lüks, idman, SUV və ekonom avtomobillərin 100$ geri qaytarılan depozit ilə icarəsi. 24/7 çatdırılma və sərfəli gündəlik, həftəlik, aylıq qiymətlər.'
        : 'Rent luxury, sports, SUV & economy cars in Baku with transparent terms and $100 refundable deposit. 24/7 delivery across Baku & Azerbaijan at competitive rates.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'AutoRental',
        name: 'Royal Baku Rent A Car',
        image: 'https://royalbakucarrental.com/assets/images/logo.png',
        '@id': 'https://royalbakucarrental.com/#organization',
        url: 'https://royalbakucarrental.com',
        telephone: '+971551073595',
        priceRange: '$$$',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Central Baku',
          addressLocality: 'Baku',
          addressCountry: 'AZ',
        },
      },
    });

    // Fetch rental price categories and cars dynamically from DRF backend API
    forkJoin({
      backendCategories: this.carService.getCategories(),
      prices: this.carService.getRentalPrices(),
    }).subscribe(({ backendCategories, prices }) => {
      if (prices && prices.length > 0) {
        if (backendCategories && backendCategories.length > 0) {
          const groups: PriceCategoryGroup[] = backendCategories.map((cat) => {
            const catNameLower = (cat.strNameKey || '').toLowerCase();
            const catSlugLower = (cat.strSlug || '').toLowerCase();

            const matchingCars = prices.filter((p) => {
              const pCatLower = (p.strCategoryName || '').toLowerCase();
              return (
                pCatLower.includes(catSlugLower) ||
                pCatLower.includes(catNameLower) ||
                catSlugLower.includes(pCatLower) ||
                catNameLower.includes(pCatLower)
              );
            });

            const targetCars = matchingCars.length > 0 ? matchingCars.slice(0, 4) : prices.slice(0, 4);
            const strTitle = cat.strNameKey || `${cat.strSlug.toUpperCase()} Cars`;

            return {
              strCategoryTitleKey: strTitle,
              strCategoryDescKey: `Rent ${strTitle} in Baku. Top-tier comfort, exceptional performance, and competitive daily rental rates.`,
              arrCarPrices: targetCars.map((c) => ({
                strCarName: c.strCarName,
                numDailyPrice: c.numDailyPrice,
              })),
            };
          });

          this.arrPriceCategories.set(groups);
        } else {
          const buildCarPrices = (list: typeof prices) =>
            list.map((c) => ({
              strCarName: c.strCarName,
              numDailyPrice: c.numDailyPrice,
            }));

          this.arrPriceCategories.set([
            {
              strCategoryTitleKey: 'Car Rental Prices',
              strCategoryDescKey: 'Transparent daily rental rates for all active cars in Baku.',
              arrCarPrices: buildCarPrices(prices.slice(0, 4)),
            },
          ]);
        }
      }
    });

    // Fetch featured & offer cars from DRF backend API
    this.carService.getFeaturedCars().subscribe((cars) => this.arrLuxuryCars.set(cars));
    this.carService.getOfferCars().subscribe((cars) => this.arrDailyOfferCars.set(cars));

    // Fetch active car categories directly from DRF backend API (/api/categories/)
    this.carService.getCategories().subscribe((backendCategories) => {
      if (backendCategories && backendCategories.length > 0) {
        const mappedCategories: HomeCategory[] = backendCategories.map((cat) => ({
          strId: cat.idCategory,
          strNameKey: `categories.${cat.strSlug}`,
          strSlug: cat.strSlug,
          strImagePath: cat.strImagePath || '',
        }));
        this.arrCategories.set(mappedCategories);
      }
    });

    // Fetch brand marquee items directly from DRF backend endpoint /api/brands/
    this.carService.getBrands().subscribe((backendBrands) => {
      if (backendBrands && backendBrands.length > 0) {
        let mapped: HomeBrand[] = backendBrands.map((b) => ({
          strId: b.idBrand,
          strName: b.strName,
          strSlug: b.strSlug,
          strLogo: b.strIconSvg,
        }));
        
        // Tile array so that marquee track is sufficiently long for a smooth, unbroken circular loop
        let tiled: HomeBrand[] = [...mapped];
        while (tiled.length < 24) {
          tiled = [...tiled, ...mapped];
        }

        this.arrBrands.set(tiled);
      }
    });

    // Fetch social links dynamically from backend site settings
    this.siteSettingService.getSiteSettings().subscribe((settings) => {
      if (settings && settings.social_links && typeof settings.social_links === 'object') {
        const arrLinks: HomeSocialItem[] = [];
        Object.entries(settings.social_links).forEach(([key, url]) => {
          if (url && typeof url === 'string' && url.trim().length > 0) {
            const strPlatform = key.toLowerCase();
            let strHandle = '';
            try {
              const objUrl = new URL(url);
              strHandle = objUrl.pathname && objUrl.pathname !== '/' ? objUrl.pathname.replace(/^\//, '@') : objUrl.hostname;
            } catch {
              strHandle = url;
            }

            arrLinks.push({
              idSocial: key,
              strName: key.charAt(0).toUpperCase() + key.slice(1),
              strIcon: strPlatform,
              strUrl: url,
              strHandle: strHandle,
            });
          }
        });
        this.arrSocialLinks.set(arrLinks);
      }
    });

    // Fetch Tour Packages for Home Preview Section
    this.tourPackageService.getTourPackages().subscribe((pkgs) => {
      const arrList = pkgs || [];
      this.numTotalTourPackages.set(arrList.length);
      this.arrTourPackages.set(arrList.slice(0, 2));
    });

    // Start hero rotating headline interval
    this.startHeroRotation();
  }

  private mutationObserver: MutationObserver | null = null;

  /**
   * Resolves cover image URL for a tour package (prefers stop order === 1, falls back to first stop)
   */
  protected getCoverImage(pkg: TourPackage): string | null {
    if (!pkg || !pkg.stops || pkg.stops.length === 0) return null;
    const stop1 = pkg.stops.find((s) => s.order === 1);
    const img = stop1?.image || pkg.stops[0]?.image;
    return img && img.trim().length > 0 ? img : null;
  }

  private startHeroRotation(): void {
    if (typeof window === 'undefined') return;

    // Check prefers-reduced-motion media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return; // Respect reduced motion: do not auto-rotate
    }

    const advancePhrase = () => {
      const current = this.numCurrentPhraseIndex();
      const next = (current + 1) % this.arrHeroPhrases.length;
      this.numExitingPhraseIndex.set(current);
      this.numCurrentPhraseIndex.set(next);

      setTimeout(() => {
        if (this.numExitingPhraseIndex() === current) {
          this.numExitingPhraseIndex.set(null);
        }
      }, 500);
    };

    this.timerHandle = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        advancePhrase();
      }
    }, 3500);

    // Pause on page visibility change
    if (typeof document !== 'undefined') {
      this.visibilityListener = () => {
        if (document.hidden && this.timerHandle) {
          clearInterval(this.timerHandle);
          this.timerHandle = null;
        } else if (!document.hidden && !this.timerHandle) {
          this.timerHandle = setInterval(() => {
            advancePhrase();
          }, 3500);
        }
      };

      document.addEventListener('visibilitychange', this.visibilityListener);
    }
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observerOptions: IntersectionObserverInit = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1,
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      const observeAllRevealElements = () => {
        const revealElements = this.elementRef.nativeElement.querySelectorAll('.reveal-on-scroll:not(.is-revealed)');
        revealElements.forEach((el: Element) => observer.observe(el));
      };

      // Initial observation scans
      observeAllRevealElements();
      setTimeout(observeAllRevealElements, 50);
      setTimeout(observeAllRevealElements, 300);

      // MutationObserver automatically watches for newly inserted @if DOM elements (e.g. tour packages or social links loaded asynchronously)
      if ('MutationObserver' in window) {
        this.mutationObserver = new MutationObserver(() => {
          observeAllRevealElements();
        });
        this.mutationObserver.observe(this.elementRef.nativeElement, {
          childList: true,
          subtree: true,
        });
      }
    }
  }

  ngOnDestroy(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
    if (this.visibilityListener && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityListener);
      this.visibilityListener = null;
    }
  }
}
