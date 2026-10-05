import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { CarService } from '../../../core/services/car.service';
import { InquiryService } from '../../../core/services/inquiry.service';
import { SiteSettingService } from '../../../core/services/site-setting.service';
import { CarDetailItem } from '../../../core/models/car.model';
import { ImagePreviewModal } from '../../../shared/components/image-preview-modal/image-preview-modal';
import { AppCurrencyPipe } from '../../../shared/pipes/app-currency.pipe';
import { IconWhatsappComponent } from '../../../shared/components/icons/icon-whatsapp';
import { IconPhoneComponent } from '../../../shared/components/icons/icon-phone';

@Component({
  selector: 'app-app-car-detail',
  standalone: true,
  imports: [RouterLink, TranslatePipe, FormsModule, ImagePreviewModal, AppCurrencyPipe, IconWhatsappComponent, IconPhoneComponent],
  templateUrl: './car-detail.html',
  styleUrl: './car-detail.css',
})
export class CarDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly carService = inject(CarService);
  private readonly inquiryService = inject(InquiryService);
  private readonly siteSettingService = inject(SiteSettingService);

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
      }
    });
  }

  protected selectGalleryImage(strImg: string, numIndex: number): void {
    this.strActiveImage.set(strImg);
    this.numActiveImageIndex.set(numIndex);
  }

  protected openPreviewModal(strUrl: string, strAlt: string = ''): void {
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

    const strMessage = `Hello Royal Baku, I would like to book ${this.strSelectedCarTitle} from ${
      this.strStartDate || 'N/A'
    } to ${this.strEndDate || 'N/A'}. Name: ${this.strCustomerName}, Phone: ${this.strCustomerPhone}`;

    // Send inquiry lead to Django DRF API
    this.inquiryService
      .submitInquiry({
        name: this.strCustomerName,
        phone: this.strCustomerPhone,
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
