import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { InquiryService, InquiryPayload, CountryCode } from '../../../../core/services/inquiry.service';

import { IconPhoneComponent } from '../../../../shared/components/icons/icon-phone';
import { CountryCodeSelect } from '../../../../shared/components/country-code-select/country-code-select';

@Component({
  selector: 'app-enquiry-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, IconPhoneComponent, CountryCodeSelect],
  templateUrl: './enquiry-bar.html',
  styleUrl: './enquiry-bar.css',
})
export class EnquiryBar implements OnInit {
  private readonly inquiryService = inject(InquiryService);

  // Form Field Models
  protected strFullName = '';
  protected strCountryCode = '+994';
  protected strMobileNo = '';
  protected strStartDate = '';
  protected strEndDate = '';

  // Min Date Constraint Values
  protected strMinStartDate = '';
  protected strMinEndDate = '';

  // Dynamic Country Codes from backend API
  protected readonly arrCountryCodes = signal<CountryCode[]>([]);

  // State Signals
  protected readonly blnSubmitted = signal<boolean>(false);
  protected readonly blnSubmitting = signal<boolean>(false);
  protected readonly blnSuccess = signal<boolean>(false);
  protected readonly blnFullNameError = signal<boolean>(false);
  protected readonly blnMobileNoError = signal<boolean>(false);
  protected readonly blnStartDateError = signal<boolean>(false);
  protected readonly blnEndDateError = signal<boolean>(false);

  ngOnInit(): void {
    this.inquiryService.getCountryCodes().subscribe((codes) => {
      if (codes && codes.length > 0) {
        this.arrCountryCodes.set(codes);
      }
    });

    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    this.strMinStartDate = this.formatDate(today);
    this.strMinEndDate = this.strMinStartDate;

    this.strStartDate = this.strMinStartDate;
    this.strEndDate = this.formatDate(threeDaysLater);
  }

  protected onStartDateChange(): void {
    if (this.strStartDate) {
      this.strMinEndDate = this.strStartDate;
      if (this.strEndDate && this.strEndDate < this.strStartDate) {
        this.strEndDate = this.strStartDate;
      }
    }
    if (this.blnSubmitted()) {
      this.validateForm();
    }
  }

  protected onEndDateChange(): void {
    if (this.blnSubmitted()) {
      this.validateForm();
    }
  }

  protected onNameInput(): void {
    if (this.strFullName && this.strFullName.trim()) {
      this.blnFullNameError.set(false);
    }
  }

  protected onMobileInput(): void {
    if (this.strMobileNo && this.strMobileNo.trim()) {
      this.blnMobileNoError.set(false);
    }
  }

  private validateForm(): boolean {
    let isValid = true;

    // Full name validation
    if (!this.strFullName || !this.strFullName.trim()) {
      this.blnFullNameError.set(true);
      isValid = false;
    } else {
      this.blnFullNameError.set(false);
    }

    // Mobile number validation
    if (!this.strMobileNo || !this.strMobileNo.trim()) {
      this.blnMobileNoError.set(true);
      isValid = false;
    } else {
      this.blnMobileNoError.set(false);
    }

    // Start date validation
    if (!this.strStartDate || this.strStartDate < this.strMinStartDate) {
      this.blnStartDateError.set(true);
      isValid = false;
    } else {
      this.blnStartDateError.set(false);
    }

    // End date validation
    if (!this.strEndDate || this.strEndDate < this.strStartDate) {
      this.blnEndDateError.set(true);
      isValid = false;
    } else {
      this.blnEndDateError.set(false);
    }

    return isValid;
  }

  protected onSendSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.blnSubmitted.set(true);

    if (!this.validateForm()) {
      return;
    }

    this.blnSubmitting.set(true);

    const cleanMobile = this.strMobileNo.trim();
    const fullPhone = `${this.strCountryCode} ${cleanMobile}`;
    const objPayload: InquiryPayload = {
      type: 'car',
      name: this.strFullName.trim(),
      phone: fullPhone,
      country_code: this.strCountryCode,
      phone_number: cleanMobile,
      pickup_date: this.strStartDate,
      dropoff_date: this.strEndDate,
      message: `Enquiry submitted from Home Page bar`,
    };

    this.inquiryService.submitInquiry(objPayload).subscribe({
      next: () => {
        this.blnSubmitting.set(false);
        this.blnSuccess.set(true);
        setTimeout(() => {
          this.blnSuccess.set(false);
          this.blnSubmitted.set(false);
          this.strFullName = '';
          this.strMobileNo = '';
        }, 5000);
      },
      error: () => {
        this.blnSubmitting.set(false);
        this.blnSuccess.set(true);
      },
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
