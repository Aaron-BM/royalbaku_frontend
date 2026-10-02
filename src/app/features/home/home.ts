import { Component, OnInit, AfterViewInit, inject, signal, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CarCard } from '../../shared/components/car-card/car-card';
import { CarItem } from '../../core/models/car.model';
import { HomeService, LatestOfferItem, PriceCategoryGroup, RentalTipItem } from './services/home.service';
import { CarService } from '../../core/services/car.service';

export interface HomeBrand {
  strId: string;
  strName: string;
  strSlug: string;
  strLogo?: string;
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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TranslatePipe, CarCard, EnquiryBar],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, AfterViewInit {
  private readonly homeService = inject(HomeService);
  private readonly carService = inject(CarService);
  private readonly elementRef = inject(ElementRef);

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

  // Brand Marquee Signal (Backend API driven - zero hardcoded data)
  protected readonly arrBrands = signal<HomeBrand[]>([]);

  protected readonly arrCategories = signal<HomeCategory[]>([
    {
      strId: 'cat-1',
      strNameKey: 'categories.suv',
      strSlug: 'suv',
      strImagePath: '/assets/images/home/cat-suv.png',
    },
    {
      strId: 'cat-3',
      strNameKey: 'categories.luxury',
      strSlug: 'luxury',
      strImagePath: '/assets/images/home/cat-luxury.png',
    },
    {
      strId: 'cat-4',
      strNameKey: 'categories.sports',
      strSlug: 'sports',
      strImagePath: '/assets/images/home/cat-sports.png',
    },
    {
      strId: 'cat-5',
      strNameKey: 'categories.convertible',
      strSlug: 'convertible',
      strImagePath: '/assets/images/home/cat-convertible.png',
    },
    {
      strId: 'cat-6',
      strNameKey: 'categories.economy',
      strSlug: 'economy',
      strImagePath: '/assets/images/home/cat-economy.png',
    },
  ]);

  // Active FAQ toggled ID signal
  protected readonly strOpenFaqId = signal<string | null>(null);

  protected toggleFaq(strId: string): void {
    this.strOpenFaqId.update((current) => (current === strId ? null : strId));
  }

  // Steps for timeline workflow
  protected readonly arrRentalSteps = signal<{ strNumber: string; strTitleKey: string; strDescKey: string; strPosition: string; strIcon: string }[]>([]);

  // Reviews Data
  protected readonly arrReviews = signal<{ strNameKey: string; strTagKey: string; strTextKey: string; strInitial: string; strColor: string }[]>([]);

  // Social Links
  protected readonly arrSocialLinks = signal<{ strNameKey: string; strHandle: string; strUrl: string; strIcon: string }[]>([]);

  // FAQ Column 1 & Column 2 Groups
  protected readonly arrFaqColumn1 = signal<{ strTitleKey: string; arrQuestions: { strId: string; strQuestionKey: string; strAnswerKey: string }[] }[]>([]);

  protected readonly arrFaqColumn2 = signal<{ strTitleKey: string; arrQuestions: { strId: string; strQuestionKey: string; strAnswerKey: string }[] }[]>([]);

  ngOnInit(): void {
    // this.homeService.getLatestOffers().subscribe((res) => this.arrLatestOffers.set(res));
    this.homeService.getPriceCategories().subscribe((res) => this.arrPriceCategories.set(res));
    // this.homeService.getRentalTips().subscribe((res) => this.objRentalTips.set(res));

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
          strImagePath: cat.strImagePath || `/assets/images/home/cat-${cat.strSlug}.png`,
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

      // Attach observer to all elements with class .reveal-on-scroll
      setTimeout(() => {
        const revealElements = this.elementRef.nativeElement.querySelectorAll('.reveal-on-scroll');
        revealElements.forEach((el: Element) => observer.observe(el));
      }, 50);
    }
  }
}
