import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { InquiryService, InquiryPayload } from '../../../../core/services/inquiry.service';

export interface CountryCodeOption {
  code: string;
  flag: string;
  dialCode: string;
}

@Component({
  selector: 'app-enquiry-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './enquiry-bar.html',
  styleUrl: './enquiry-bar.css',
})
export class EnquiryBar implements OnInit {
  private readonly inquiryService = inject(InquiryService);

  // Form Field Models
  protected strFullName = '';
  protected strCountryCode = '+971';
  protected strMobileNo = '';
  protected strStartDate = '';
  protected strEndDate = '';

  // Min Date Constraint Values
  protected strMinStartDate = '';
  protected strMinEndDate = '';

  // State Signals
  protected readonly blnSubmitted = signal<boolean>(false);
  protected readonly blnSubmitting = signal<boolean>(false);
  protected readonly blnSuccess = signal<boolean>(false);
  protected readonly blnFullNameError = signal<boolean>(false);
  protected readonly blnMobileNoError = signal<boolean>(false);
  protected readonly blnStartDateError = signal<boolean>(false);
  protected readonly blnEndDateError = signal<boolean>(false);

  // Country Code Options
  protected readonly arrCountryCodes: CountryCodeOption[] = [
    { code: 'AE', flag: '🇦🇪', dialCode: '+971' },
    { code: 'AZ', flag: '🇦🇿', dialCode: '+994' },
    { code: 'SA', flag: '🇸🇦', dialCode: '+966' },
    { code: 'QA', flag: '🇶🇦', dialCode: '+974' },
    { code: 'KW', flag: '🇰🇼', dialCode: '+965' },
    { code: 'GB', flag: '🇬🇧', dialCode: '+44' },
    { code: 'US', flag: '🇺🇸', dialCode: '+1' },
  ];

  ngOnInit(): void {
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

    const fullPhone = `${this.strCountryCode} ${this.strMobileNo.trim()}`;
    const objPayload: InquiryPayload = {
      name: this.strFullName.trim(),
      phone: fullPhone,
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
