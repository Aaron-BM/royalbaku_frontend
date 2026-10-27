import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { CarService } from '../../../core/services/car.service';
import { InquiryService, CountryCode } from '../../../core/services/inquiry.service';
import { SiteSettingService } from '../../../core/services/site-setting.service';
import { CarDetailItem } from '../../../core/models/car.model';
import { ImagePreviewModal } from '../../../shared/components/image-preview-modal/image-preview-modal';
import { AppCurrencyPipe } from '../../../shared/pipes/app-currency.pipe';
import { IconWhatsappComponent } from '../../../shared/components/icons/icon-whatsapp';
import { IconPhoneComponent } from '../../../shared/components/icons/icon-phone';
import { CountryCodeSelect } from '../../../shared/components/country-code-select/country-code-select';

import { SeoService } from '../../../core/services/seo.service';
import { LanguageService } from '../../../core/services/language.service';
import { LangUrlPipe } from '../../../shared/pipes/lang-url.pipe';
import { STANDARD_CAR_DEPOSIT_USD } from '../../../core/constants/pricing.constants';
import { parseI18nString } from '../../../core/utils/car-adapter';

@Component({
  selector: 'app-car-detail-az',
  standalone: true,
  imports: [RouterLink, TranslatePipe, FormsModule, ImagePreviewModal, AppCurrencyPipe, IconWhatsappComponent, IconPhoneComponent, LangUrlPipe, CountryCodeSelect],
  templateUrl: './car-detail-az.html',
  styleUrl: './car-detail-az.css',
})
export class CarDetailAz implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly carService = inject(CarService);
  private readonly inquiryService = inject(InquiryService);
  private readonly siteSettingService = inject(SiteSettingService);
  private readonly svcSog = inject(SeoService);
  protected readonly svcLanguage = inject(LanguageService);
  protected readonly numStandardDeposit = STANDARD_CAR_DEPOSIT_USD;

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

  // Booking Form Fields
  protected strCustomerName = '';
  protected strCustomerEmail = '';
  protected strCustomerPhone = '';
  protected strStartDate = '';
  protected strEndDate = '';
  protected strSelectedCarTitle = '';

  ngOnInit(): void {
    this.inquiryService.getCountryCodes().subscribe((codes) => {
      if (codes && codes.length > 0) {
        this.arrCountryCodes.set(codes);
      }
    });

    this.route.paramMap.subscribe((params) => {
      const strSlug = params.get('slug') || '';
      if (strSlug) {
        this.loadCarDetail(strSlug);
      }
    });
  }

  private loadCarDetail(strSlug: string): void {
    this.carService.getCarBySlug(strSlug).subscribe((objResult) => {
      if (objResult) {
        this.objCar.set(objResult);
        this.strSelectedCarTitle = objResult.strTitle;
        const arrImages = objResult.arrGalleryImages || [objResult.strImagePath];
        this.strActiveImage.set(arrImages[0]);
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
      }
    });
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

    // Send inquiry lead to Django DRF API
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

    // Open WhatsApp redirect
    const urlWa = this.siteSettingService.getWhatsappUrl(currentCar?.strWhatsappNumber, strMessage);
    if (typeof window !== 'undefined' && urlWa) {
      window.open(urlWa, '_blank');
    }
  }

  protected get strWhatsappHref(): string | null {
    const objCurrent = this.objCar();
    const strMsg = `Hello Royal Baku, I would like to inquire about renting ${objCurrent?.strTitle || 'a car'}.`;
    return this.siteSettingService.getWhatsappUrl(objCurrent?.strWhatsappNumber, strMsg);
  }

  protected get strPhoneHref(): string | null {
    const objCurrent = this.objCar();
    return this.siteSettingService.getPhoneUrl(objCurrent?.strWhatsappNumber);
  }

  protected hasAnySpecs(car: CarDetailItem): boolean {
    if (car.numDepositUsd != null || (car.objSpecs?.strDepositValue != null && car.objSpecs.strDepositValue !== '')) return true;
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
