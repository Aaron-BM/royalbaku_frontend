import { Component, OnInit, AfterViewInit, inject, signal, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
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
  protected readonly arrRentalSteps = signal<{ strNumber: string; strTitleKey: string; strDescKey: string; strPosition: string; strIcon: string }[]>([
    { strNumber: '01', strTitleKey: 'home.stepProcess.step1Title', strDescKey: 'home.stepProcess.step1Desc', strPosition: 'left', strIcon: 'car' },
    { strNumber: '02', strTitleKey: 'home.stepProcess.step2Title', strDescKey: 'home.stepProcess.step2Desc', strPosition: 'right', strIcon: 'whatsapp' },
    { strNumber: '03', strTitleKey: 'home.stepProcess.step3Title', strDescKey: 'home.stepProcess.step3Desc', strPosition: 'left', strIcon: 'confirm' },
    { strNumber: '04', strTitleKey: 'home.stepProcess.step4Title', strDescKey: 'home.stepProcess.step4Desc', strPosition: 'right', strIcon: 'key' },
  ]);

  // Reviews Data
  protected readonly arrReviews = signal<{ strNameKey: string; strTagKey: string; strTextKey: string; strInitial: string; strColor: string }[]>([
    { strNameKey: 'home.reviews.review1Name', strTagKey: 'home.reviews.review1Tag', strTextKey: 'home.reviews.review1Text', strInitial: 'K', strColor: 'bg-emerald-600' },
    { strNameKey: 'home.reviews.review2Name', strTagKey: 'home.reviews.review2Tag', strTextKey: 'home.reviews.review2Text', strInitial: 'E', strColor: 'bg-blue-600' },
    { strNameKey: 'home.reviews.review3Name', strTagKey: 'home.reviews.review3Tag', strTextKey: 'home.reviews.review3Text', strInitial: 'Y', strColor: 'bg-amber-600' },
    { strNameKey: 'home.reviews.review4Name', strTagKey: 'home.reviews.review4Tag', strTextKey: 'home.reviews.review4Text', strInitial: 'M', strColor: 'bg-purple-600' },
  ]);

  // Social Links
  protected readonly arrSocialLinks = signal<{ strNameKey: string; strHandle: string; strUrl: string; strIcon: string }[]>([
    { strNameKey: 'home.social.instagram', strHandle: '@royalbaku_car', strUrl: 'https://instagram.com', strIcon: 'instagram' },
    { strNameKey: 'home.social.facebook', strHandle: 'Royal Baku Rent A Car', strUrl: 'https://facebook.com', strIcon: 'facebook' },
    { strNameKey: 'home.social.youtube', strHandle: 'Royal Baku Channel', strUrl: 'https://youtube.com', strIcon: 'youtube' },
    { strNameKey: 'home.social.tiktok', strHandle: '@royalbaku', strUrl: 'https://tiktok.com', strIcon: 'tiktok' },
  ]);

  // FAQ Column 1 & Column 2 Groups
  protected readonly arrFaqColumn1 = signal<{ strTitleKey: string; arrQuestions: { strId: string; strQuestionKey: string; strAnswerKey: string }[] }[]>([
    {
      strTitleKey: 'home.faq.mileageGroup',
      arrQuestions: [
        { strId: 'q1', strQuestionKey: 'home.faq.q1', strAnswerKey: 'home.faq.a1' },
        { strId: 'q2', strQuestionKey: 'home.faq.q2', strAnswerKey: 'home.faq.a2' },
        { strId: 'q3', strQuestionKey: 'home.faq.q3', strAnswerKey: 'home.faq.a3' },
        { strId: 'q4', strQuestionKey: 'home.faq.q4', strAnswerKey: 'home.faq.a4' },
      ],
    },
    {
      strTitleKey: 'home.faq.bookingGroup',
      arrQuestions: [
        { strId: 'q5', strQuestionKey: 'home.faq.q5', strAnswerKey: 'home.faq.a5' },
        { strId: 'q6', strQuestionKey: 'home.faq.q6', strAnswerKey: 'home.faq.a6' },
        { strId: 'q7', strQuestionKey: 'home.faq.q7', strAnswerKey: 'home.faq.a7' },
        { strId: 'q8', strQuestionKey: 'home.faq.q8', strAnswerKey: 'home.faq.a8' },
      ],
    },
  ]);

  protected readonly arrFaqColumn2 = signal<{ strTitleKey: string; arrQuestions: { strId: string; strQuestionKey: string; strAnswerKey: string }[] }[]>([
    {
      strTitleKey: 'home.faq.drivingGroup',
      arrQuestions: [
        { strId: 'q9', strQuestionKey: 'home.faq.q9', strAnswerKey: 'home.faq.a9' },
        { strId: 'q10', strQuestionKey: 'home.faq.q10', strAnswerKey: 'home.faq.a10' },
        { strId: 'q11', strQuestionKey: 'home.faq.q11', strAnswerKey: 'home.faq.a11' },
      ],
    },
    {
      strTitleKey: 'home.faq.insuranceGroup',
      arrQuestions: [
        { strId: 'q12', strQuestionKey: 'home.faq.q12', strAnswerKey: 'home.faq.a12' },
        { strId: 'q13', strQuestionKey: 'home.faq.q13', strAnswerKey: 'home.faq.a13' },
        { strId: 'q14', strQuestionKey: 'home.faq.q14', strAnswerKey: 'home.faq.a14' },
      ],
    },
  ]);

  ngOnInit(): void {
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
                strPrice: `$${c.numDailyPrice} / day`,
              })),
            };
          });

          this.arrPriceCategories.set(groups);
        } else {
          const buildCarPrices = (list: typeof prices) =>
            list.map((c) => ({
              strCarName: c.strCarName,
              strPrice: `$${c.numDailyPrice} / day`,
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
