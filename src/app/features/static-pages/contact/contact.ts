import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { InquiryService, CountryCode } from '../../../core/services/inquiry.service';
import { SiteSettingService } from '../../../core/services/site-setting.service';
import { CarService } from '../../../core/services/car.service';
import { CarDetailItem } from '../../../core/models/car.model';

import { IconWhatsappComponent } from '../../../shared/components/icons/icon-whatsapp';
import { IconPhoneComponent } from '../../../shared/components/icons/icon-phone';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, TranslatePipe, IconWhatsappComponent, IconPhoneComponent],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit {
  private readonly inquiryService = inject(InquiryService);
  private readonly siteSettingService = inject(SiteSettingService);
  private readonly carService = inject(CarService);

  // Loading & View States
  protected readonly blnLoading = signal<boolean>(true);
  protected readonly blnSubmitting = signal<boolean>(false);
  protected readonly blnSubmitted = signal<boolean>(false);
  protected readonly strErrorMessage = signal<string>('');
  protected readonly strSuccessMessage = signal<string>('');

  // Backend Data Signals
  protected readonly strWhatsappHref = signal<string | null>(null);
  protected readonly strPhoneHref = signal<string | null>(null);
  protected readonly strPhoneNumberDisplay = signal<string>('');
  protected readonly strWhatsappNumberDisplay = signal<string>('');
  protected readonly strEmailDisplay = signal<string>('');
  protected readonly strAddressDisplay = signal<string>('');
  protected readonly strHoursDisplay = signal<string>('');
  protected readonly strSocialDisplay = signal<string>('');

  protected readonly arrCountryCodes = signal<CountryCode[]>([]);
  protected readonly strSelectedCountryCode = signal<string>('+994');
  protected readonly arrAvailableCars = signal<CarDetailItem[]>([]);

  // Min Date Validations
  protected readonly strTodayIso = new Date().toISOString().split('T')[0];
  protected readonly strMinPickupDate = signal<string>(this.strTodayIso);
  protected readonly strMinReturnDate = signal<string>(this.strTodayIso);

  // Reactive Form State
  protected readonly objFormData = signal({
    strName: '',
    strEmail: '',
    strCar: '',
    strPhone: '',
    strStartDate: this.strTodayIso,
    strEndDate: this.strTodayIso,
    strMessage: '',
  });

  ngOnInit(): void {
    this.fnLoadPageData();
  }

  private fnLoadPageData(): void {
    this.blnLoading.set(true);

    // 1. Load Site Settings
    this.siteSettingService.getSiteSettings().subscribe((settings) => {
      if (settings) {
        this.strPhoneNumberDisplay.set(settings.phone_number || '');
        this.strWhatsappNumberDisplay.set(settings.whatsapp_number || '');
        this.strEmailDisplay.set(settings.email || '');

        if (settings.address) {
          const addr =
            typeof settings.address === 'object'
              ? settings.address.en || settings.address.az || JSON.stringify(settings.address)
              : String(settings.address);
          this.strAddressDisplay.set(addr);
        }

        if (settings.working_hours) {
          const hours =
            typeof settings.working_hours === 'object'
              ? settings.working_hours.en || settings.working_hours.az || JSON.stringify(settings.working_hours)
              : String(settings.working_hours);
          this.strHoursDisplay.set(hours);
        }

        if (settings.social_links) {
          const insta = settings.social_links.instagram || settings.social_links.facebook || '@royalbakucar';
          this.strSocialDisplay.set(insta.replace(/^https?:\/\/(www\.)?(instagram|facebook)\.com\/?/, '@'));
        }

        this.strWhatsappHref.set(this.siteSettingService.getWhatsappUrl(settings.whatsapp_number));
        this.strPhoneHref.set(this.siteSettingService.getPhoneUrl(settings.phone_number));
      }
    });

    // 2. Load Backend Country Codes
    this.inquiryService.getCountryCodes().subscribe((codes) => {
      if (codes && codes.length > 0) {
        this.arrCountryCodes.set(codes);
      }
    });

    // 3. Load Available Vehicles from Backend Fleet API
    this.carService.getAllCars().subscribe((cars) => {
      this.arrAvailableCars.set(cars || []);
      this.blnLoading.set(false);
    });
  }

  protected fnOnPickupDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const val = target ? target.value : '';
    if (val) {
      this.strMinReturnDate.set(val);
      const currentForm = this.objFormData();
      if (currentForm.strEndDate && currentForm.strEndDate < val) {
        this.objFormData.set({ ...currentForm, strEndDate: val });
      }
    } else {
      this.strMinReturnDate.set(this.strTodayIso);
    }
  }

  protected fnResetForm(): void {
    this.blnSubmitted.set(false);
    this.strErrorMessage.set('');
    this.strSuccessMessage.set('');
    this.objFormData.set({
      strName: '',
      strEmail: '',
      strCar: '',
      strPhone: '',
      strStartDate: this.strTodayIso,
      strEndDate: this.strTodayIso,
      strMessage: '',
    });
  }

  protected fnOnSubmit(): void {
    if (this.blnSubmitting()) return;

    const data = this.objFormData();
    this.strErrorMessage.set('');

    if (!data.strName || !data.strName.trim()) {
      this.strErrorMessage.set('Please enter your name.');
      return;
    }

    if (!data.strPhone || !data.strPhone.trim()) {
      this.strErrorMessage.set('Please enter your phone number.');
      return;
    }

    const cleanPhone = data.strPhone.trim();
    if (cleanPhone.length < 5) {
      this.strErrorMessage.set('Please enter a valid phone number.');
      return;
    }

    if (data.strEmail && data.strEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.strEmail.trim())) {
        this.strErrorMessage.set('Please enter a valid email address.');
        return;
      }
    }

    if (!data.strCar || !data.strCar.trim() || data.strCar.trim().toLowerCase() === 'none') {
      this.strErrorMessage.set('Please select a vehicle.');
      return;
    }

    if (data.strStartDate && data.strStartDate < this.strTodayIso) {
      this.strErrorMessage.set('Pickup date cannot be in the past.');
      return;
    }

    if (data.strStartDate && data.strEndDate && data.strEndDate < data.strStartDate) {
      this.strErrorMessage.set('Return date cannot be earlier than pickup date.');
      return;
    }

    const fullPhone = `${this.strSelectedCountryCode()} ${cleanPhone}`;

    this.blnSubmitting.set(true);

    this.inquiryService
      .submitInquiry({
        name: data.strName.trim(),
        phone: fullPhone,
        country_code: this.strSelectedCountryCode(),
        phone_number: cleanPhone,
        email: data.strEmail ? data.strEmail.trim() : undefined,
        preferred_vehicle: data.strCar ? data.strCar.trim() : undefined,
        pickup_date: data.strStartDate || undefined,
        dropoff_date: data.strEndDate || undefined,
        message: data.strMessage ? data.strMessage.trim() : undefined,
      })
      .subscribe({
        next: (res) => {
          this.blnSubmitting.set(false);
          this.blnSubmitted.set(true);
          this.strSuccessMessage.set(
            res?.message || 'Thank you! Your instant request has been submitted successfully.'
          );
        },
        error: (err) => {
          this.blnSubmitting.set(false);
          console.error('Inquiry submission error:', err);
          let msg = 'Failed to submit request. Please try again.';
          if (err?.error) {
            if (typeof err.error === 'string') {
              msg = err.error;
            } else if (err.error.message) {
              msg = err.error.message;
            } else if (typeof err.error === 'object') {
              const firstKey = Object.keys(err.error)[0];
              const firstVal = err.error[firstKey];
              msg = `${firstKey}: ${Array.isArray(firstVal) ? firstVal.join(', ') : firstVal}`;
            }
          }
          this.strErrorMessage.set(msg);
        },
      });
  }


}

