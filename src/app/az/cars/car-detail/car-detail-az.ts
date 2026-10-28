import { Component, OnInit, OnDestroy, inject, signal, PLATFORM_ID, RESPONSE_INIT } from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, Subscription, EMPTY, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { CarService, CarDetailResult } from '../../../core/services/car.service';
import { InquiryService, CountryCode } from '../../../core/services/inquiry.service';
import { SiteSettingService } from '../../../core/services/site-setting.service';
import { CarDetailItem } from '../../../core/models/car.model';
import { ImagePreviewModal } from '../../../shared/components/image-preview-modal/image-preview-modal';
import { AppCurrencyPipe } from '../../../shared/pipes/app-currency.pipe';
import { IconWhatsappComponent } from '../../../shared/components/icons/icon-whatsapp';
import { IconPhoneComponent } from '../../../shared/components/icons/icon-phone';
import { CountryCodeSelect } from '../../../shared/components/country-code-select/country-code-select';
import { CarDetailSkeleton } from '../../../shared/components/car-detail-skeleton/car-detail-skeleton';

import { SeoService } from '../../../core/services/seo.service';
import { LanguageService } from '../../../core/services/language.service';
import { LangUrlPipe } from '../../../shared/pipes/lang-url.pipe';
import { STANDARD_CAR_DEPOSIT_USD } from '../../../core/constants/pricing.constants';
import { parseI18nString } from '../../../core/utils/car-adapter';

@Component({
  selector: 'app-car-detail-az',
  standalone: true,
  imports: [
    RouterLink,
    TranslatePipe,
    FormsModule,
    ImagePreviewModal,
    AppCurrencyPipe,
    IconWhatsappComponent,
    IconPhoneComponent,
    LangUrlPipe,
    CountryCodeSelect,
    CarDetailSkeleton,
  ],
  templateUrl: './car-detail-az.html',
  styleUrl: './car-detail-az.css',
})
export class CarDetailAz implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly carService = inject(CarService);
  private readonly inquiryService = inject(InquiryService);
  private readonly siteSettingService = inject(SiteSettingService);
  private readonly svcSog = inject(SeoService);
  protected readonly svcLanguage = inject(LanguageService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

  protected readonly numStandardDeposit = STANDARD_CAR_DEPOSIT_USD;

  // Single State Signal: loading | loaded | notFound | error
  protected readonly state = signal<'loading' | 'loaded' | 'notFound' | 'error'>('loading');

  private isInitialHydration = true;
  private readonly retrySubject$ = new BehaviorSubject<number>(0);
  private routeSub: Subscription | null = null;
  private countrySub: Subscription | null = null;
  private showSkeletonTimer: any = null;
  private minDisplayTimer: any = null;

  protected get strCarDescription(): string {
    const car = this.objCar();
    if (!car) return '';
    const lang = this.svcLanguage.strCurrentLang();
    if (car.rawDescription) {
      const localized = parseI18nString(car.rawDescription, lang);
      if (localized) return localized;
    }
    return car.strDescription || car.strDescriptionKey || '';
  }

  // Dynamic Country Codes from backend
  protected readonly arrCountryCodes = signal<CountryCode[]>([]);
  protected strSelectedCountryCode = '+994';

  // Car details signal state
  protected readonly objCar = signal<CarDetailItem | null>(null);
  protected readonly strActiveImage = signal<string>('');
  protected readonly numActiveImageIndex = signal<number>(0);

  // Full-screen Image Preview Modal state
  protected readonly blnIsImageModalOpen = signal<boolean>(false);
  protected readonly strPreviewImageUrl = signal<string | null>(null);
  protected readonly strPreviewAltText = signal<string>('');

  // Booking Form Fields (retained across slug switches)
  protected strCustomerName = '';
  protected strCustomerEmail = '';
  protected strCustomerPhone = '';
  protected strStartDate = '';
  protected strEndDate = '';
  protected strSelectedCarTitle = '';

  ngOnInit(): void {
    this.countrySub = this.inquiryService.getCountryCodes().subscribe((codes) => {
      if (codes && codes.length > 0) {
        this.arrCountryCodes.set(codes);
      }
    });

    let lastLoadedSlug = '';

    this.routeSub = combineLatest([this.route.paramMap, this.retrySubject$])
      .pipe(
        map(([params, retryIndex]) => ({
          slug: (params.get('slug') || '').trim(),
          retryIndex,
        })),
        switchMap(({ slug, retryIndex }) => {
          const isInitial = this.isInitialHydration || isPlatformServer(this.platformId);
          let skeletonShownTime = 0;

          if (!slug) {
            return of({
              slug: '',
              result: { status: 'notFound' as const, httpStatus: 404 as const },
              isInitial,
              skeletonShownTime: 0,
            });
          }

          if (slug === lastLoadedSlug && this.state() === 'loaded' && retryIndex === 0) {
            return EMPTY;
          }

          if (this.showSkeletonTimer) clearTimeout(this.showSkeletonTimer);
          if (this.minDisplayTimer) clearTimeout(this.minDisplayTimer);

          if (!isInitial) {
            this.resetCarState();

            if (isPlatformBrowser(this.platformId)) {
              window.scrollTo({ top: 0, behavior: 'instant' });
            }

            this.showSkeletonTimer = setTimeout(() => {
              skeletonShownTime = Date.now();
              this.state.set('loading');
            }, 150);
          } else {
            this.state.set('loading');
          }

          return this.carService.getCarBySlugResult(slug).pipe(
            map((result: CarDetailResult) => ({
              slug,
              result,
              isInitial,
              skeletonShownTime,
            }))
          );
        })
      )
      .subscribe(({ slug, result, isInitial, skeletonShownTime }) => {
        if (this.showSkeletonTimer) clearTimeout(this.showSkeletonTimer);

        const applyResult = () => {
          if (result.status === 'ok') {
            lastLoadedSlug = slug;
            this.applyLoadedCar(result.car);
          } else if (result.status === 'notFound') {
            lastLoadedSlug = '';
            this.applyNotFound(result.httpStatus);
          } else {
            lastLoadedSlug = '';
            this.applyError();
          }
        };

        if (isInitial) {
          this.isInitialHydration = false;
          applyResult();
        } else if (skeletonShownTime > 0) {
          const elapsed = Date.now() - skeletonShownTime;
          const remaining = Math.max(0, 300 - elapsed);
          this.minDisplayTimer = setTimeout(applyResult, remaining);
        } else {
          applyResult();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.showSkeletonTimer) clearTimeout(this.showSkeletonTimer);
    if (this.minDisplayTimer) clearTimeout(this.minDisplayTimer);
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.countrySub) this.countrySub.unsubscribe();
    if (this.state() === 'notFound' || this.state() === 'error') {
      this.svcSog.fnSetSeo({
        title: 'Royal Baku Rent A Car',
        description: 'Bakıda Lüks və Ekonom Avtomobil İcarəsi.',
      });
    }
  }

  protected retryLoad(): void {
    if (this.showSkeletonTimer) clearTimeout(this.showSkeletonTimer);
    if (this.minDisplayTimer) clearTimeout(this.minDisplayTimer);
    this.state.set('loading');
    this.retrySubject$.next(this.retrySubject$.value + 1);
  }

  private resetCarState(): void {
    this.objCar.set(null);
    this.strActiveImage.set('');
    this.numActiveImageIndex.set(0);
    this.blnIsImageModalOpen.set(false);
    this.strPreviewImageUrl.set(null);
    this.strPreviewAltText.set('');
    this.strSelectedCarTitle = '';
  }

  private applyLoadedCar(objResult: CarDetailItem): void {
    this.objCar.set(objResult);
    this.strSelectedCarTitle = objResult.strTitle;
    const arrImages = objResult.arrGalleryImages || [objResult.strImagePath];
    this.strActiveImage.set(arrImages[0] || '');
    this.numActiveImageIndex.set(0);

    const isAz = this.svcLanguage.strCurrentLang() === 'az';
    this.svcSog.fnSetSeo({
      title: isAz
        ? `${objResult.strTitle} İcarəsi Bakıda | Royal Baku Rent A Car`
        : `${objResult.strTitle} Rental in Baku | Royal Baku Car Rental`,
      description: isAz
        ? `Bakıda ${objResult.strTitle} icarəsi. 100$ geri qaytarılan depozit, 24/7 hava limanı çatdırılması.`
        : `Rent ${objResult.strTitle} in Baku with transparent terms, $100 refundable deposit, and 24/7 airport delivery.`,
      image: objResult.strImagePath,
      type: 'product',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: objResult.strTitle,
        image: objResult.strImagePath ? [objResult.strImagePath] : [],
        description: `Rent ${objResult.strTitle} in Baku, Azerbaijan.`,
        offers: {
          '@type': 'Offer',
          price: objResult.numDailyPrice,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      },
    });

    this.state.set('loaded');
  }

  private applyNotFound(httpStatus?: number): void {
    if (isPlatformServer(this.platformId) && this.responseInit) {
      this.responseInit.status = httpStatus || 404;
    }
    const isAz = this.svcLanguage.strCurrentLang() === 'az';
    this.svcSog.fnSetNoIndex(
      isAz ? 'Avtomobil Tapılmadı' : 'Vehicle Not Found',
      isAz
        ? 'Axtardığınız avtomobil artıq mövcud deyil və ya keçid yanlışdır.'
        : 'The vehicle you are looking for is no longer available or the link is incorrect.'
    );
    this.state.set('notFound');
  }

  private applyError(): void {
    if (isPlatformServer(this.platformId) && this.responseInit) {
      this.responseInit.status = 503;
    }
    const isAz = this.svcLanguage.strCurrentLang() === 'az';
    this.svcSog.fnSetNoIndex(
      isAz ? 'Xidmət Müvəqqəti Əlçatmazdır' : 'Service Temporarily Unavailable',
      isAz
        ? 'Sistemdə müvəqqəti xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.'
        : 'A temporary error occurred while retrieving vehicle details. Please try again.'
    );
    this.state.set('error');
  }

  protected selectGalleryImage(strImg: string, numIndex: number): void {
    this.strActiveImage.set(strImg);
    this.numActiveImageIndex.set(numIndex);
  }

  protected openPreviewModal(strUrl: string, strAlt: string = '', numIndex?: number): void {
    if (numIndex !== undefined) {
      this.numActiveImageIndex.set(numIndex);
    }
    this.strPreviewImageUrl.set(strUrl);
    this.strPreviewAltText.set(strAlt);
    this.blnIsImageModalOpen.set(true);
  }

  protected closePreviewModal(): void {
    this.blnIsImageModalOpen.set(false);
    this.strPreviewImageUrl.set(null);
  }

  protected prevImage(): void {
    const objCurrentCar = this.objCar();
    if (!objCurrentCar || !objCurrentCar.arrGalleryImages) return;

    const numTotal = objCurrentCar.arrGalleryImages.length;
    const numPrev = (this.numActiveImageIndex() - 1 + numTotal) % numTotal;
    this.numActiveImageIndex.set(numPrev);
    this.strActiveImage.set(objCurrentCar.arrGalleryImages[numPrev]);
  }

  protected nextImage(): void {
    const objCurrentCar = this.objCar();
    if (!objCurrentCar || !objCurrentCar.arrGalleryImages) return;

    const numTotal = objCurrentCar.arrGalleryImages.length;
    const numNext = (this.numActiveImageIndex() + 1) % numTotal;
    this.numActiveImageIndex.set(numNext);
    this.strActiveImage.set(objCurrentCar.arrGalleryImages[numNext]);
  }

  protected onBookingSubmit(): void {
    if (!this.strCustomerName || !this.strCustomerPhone) {
      alert('Please enter your name and phone number.');
      return;
    }

    const currentCar = this.objCar();
    const carId = currentCar ? (isNaN(Number(currentCar.idCar)) ? null : Number(currentCar.idCar)) : null;
    const cleanPhone = this.strCustomerPhone.trim();
    const fullPhone = `${this.strSelectedCountryCode} ${cleanPhone}`;

    const strMessage = `Hello Royal Baku, I would like to book ${this.strSelectedCarTitle} from ${
      this.strStartDate || 'N/A'
    } to ${this.strEndDate || 'N/A'}. Name: ${this.strCustomerName}, Phone: ${fullPhone}`;

    this.inquiryService
      .submitInquiry({
        type: 'car',
        name: this.strCustomerName,
        phone: fullPhone,
        country_code: this.strSelectedCountryCode,
        phone_number: cleanPhone,
        email: this.strCustomerEmail || undefined,
        is_whatsapp: true,
        car: carId,
        pickup_date: this.strStartDate || undefined,
        dropoff_date: this.strEndDate || undefined,
        message: strMessage,
      })
      .subscribe({
        next: (res) => {
          console.log('Inquiry registered on backend:', res);
        },
      });

    const urlWa = this.siteSettingService.getWhatsappUrl(currentCar?.strWhatsappNumber, strMessage);
    if (typeof window !== 'undefined' && urlWa) {
      window.open(urlWa, '_blank');
    }
  }

  protected get strWhatsappHref(): string | null {
    const objCurrent = this.objCar();
    if (!objCurrent) return null;
    const strMsg = `Hello Royal Baku, I would like to inquire about renting ${objCurrent.strTitle}.`;
    return this.siteSettingService.getWhatsappUrl(objCurrent.strWhatsappNumber, strMsg);
  }

  protected get strPhoneHref(): string | null {
    const objCurrent = this.objCar();
    if (!objCurrent) return null;
    return this.siteSettingService.getPhoneUrl(objCurrent.strWhatsappNumber);
  }

  protected getCarConciergeWhatsappHref(): string {
    const objCurrent = this.objCar();
    const title = objCurrent ? objCurrent.strTitle : 'a car';
    const lang = this.svcLanguage.strCurrentLang();
    const strMsg =
      lang === 'az'
        ? `Salam, Royal Baku Car Rental. ${title} avtomobilinin bron edilməsi və mövcudluğu barədə məlumat almaq istəyirəm.`
        : `Hello, Royal Baku Car Rental. I would like to check immediate availability and reserve the ${title}.`;
    return this.siteSettingService.getWhatsappUrl(objCurrent?.strWhatsappNumber, strMsg) || 'https://wa.me/994512019191';
  }

  protected hasAnySpecs(car: CarDetailItem): boolean {
    if (car.numDepositUsd != null || (car.objSpecs?.strDepositValue != null && car.objSpecs.strDepositValue !== ''))
      return true;
    if (!car.objSpecs) return false;
    const s = car.objSpecs;
    return Boolean(
      s.numMileageLimitKm ||
        s.strExtraMileageRate ||
        s.strPaymentMethodsKey ||
        s.strColor ||
        s.strTransmission ||
        s.strCarType ||
        s.strEngine ||
        s.numSeats ||
        s.numDoors ||
        s.strAcceleration0To100 ||
        s.strDriveTrain ||
        s.strFuelType ||
        s.numLuggageCount
    );
  }
}
