import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TourPackageService } from '../../../core/services/tour-package.service';
import { TourPackage } from '../../../core/models/tour-package.model';
import { TourPackageCard } from '../components/tour-package-card/tour-package-card';
import { InquiryService } from '../../../core/services/inquiry.service';
import { SiteSettingService } from '../../../core/services/site-setting.service';

@Component({
  selector: 'app-tour-packages-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TourPackageCard],
  templateUrl: './tour-packages-page.html',
  styleUrl: './tour-packages-page.css',
})
export class TourPackagesPage implements OnInit {
  private readonly tourService = inject(TourPackageService);
  private readonly inquiryService = inject(InquiryService);
  private readonly siteSettingService = inject(SiteSettingService);

  protected readonly arrPackages = signal<TourPackage[]>([]);
  protected readonly strExpandedId = signal<string | null>(null);
  protected readonly blnIsLoading = signal<boolean>(true);

  // Dynamic Contact Signals (Driven by SiteSettingService)
  protected readonly strPhoneHref = signal<string | null>(null);
  protected readonly strPhoneDisplay = signal<string>('');
  protected readonly strWhatsappHref = signal<string | null>(null);
  protected readonly strWhatsappDisplay = signal<string>('');
  protected readonly strEmailDisplay = signal<string>('');

  // Inquiry / Booking Modal State
  protected readonly blnIsModalOpen = signal(false);
  protected readonly blnSubmitSuccess = signal(false);
  protected objSelectedPackage = signal<TourPackage | null>(null);

  protected strCustomerName = '';
  protected strCustomerPhone = '';
  protected strTravelDate = '';
  protected strSpecialRequest = '';

  ngOnInit(): void {
    // Fetch backend Site Settings for contacts
    this.siteSettingService.getSiteSettings().subscribe((settings) => {
      const rawPhone = settings?.phone_number;
      const rawWa = settings?.whatsapp_number;
      this.strPhoneDisplay.set(rawPhone || '');
      this.strPhoneHref.set(this.siteSettingService.getPhoneUrl(rawPhone));
      this.strWhatsappDisplay.set(rawWa || '');
      this.strWhatsappHref.set(
        this.siteSettingService.getWhatsappUrl(
          rawWa,
          'Hello Royal Baku, I would like to inquire about your private tour packages in Azerbaijan.'
        )
      );
      this.strEmailDisplay.set(settings?.email || 'info@royalbaku.az');
    });

    this.blnIsLoading.set(true);
    this.tourService.getTourPackages().subscribe({
      next: (pkgs) => {
        this.arrPackages.set(pkgs || []);
        if (pkgs && pkgs.length > 0) {
          this.strExpandedId.set(pkgs[0].id); // Expand first package by default
        }
        this.blnIsLoading.set(false);
      },
      error: () => {
        this.arrPackages.set([]);
        this.blnIsLoading.set(false);
      },
    });
  }

  protected onToggleExpand(id: string): void {
    this.strExpandedId.update((currentId) => (currentId === id ? null : id));
  }

  protected openInquiryModal(pkg: TourPackage): void {
    this.objSelectedPackage.set(pkg);
    this.blnSubmitSuccess.set(false);
    this.blnIsModalOpen.set(true);
  }

  protected closeModal(): void {
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const numCurrentY = typeof window !== 'undefined' ? window.scrollY : 0;
    this.blnIsModalOpen.set(false);
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        window.scrollTo({ top: numCurrentY, left: 0, behavior: 'instant' as ScrollBehavior });
      });
    }
  }

  protected onSubmitInquiry(): void {
    if (!this.strCustomerName.trim() || !this.strCustomerPhone.trim()) {
      alert('Please enter your name and phone number.');
      return;
    }

    const pkg = this.objSelectedPackage();
    const strMsg = `Tour Package Booking: ${pkg?.title || 'City Tour Package'} (${pkg?.subtitle || ''}). Date: ${
      this.strTravelDate || 'N/A'
    }. Customer: ${this.strCustomerName}, Phone: ${this.strCustomerPhone}. Message: ${this.strSpecialRequest || 'None'}`;

    this.inquiryService
      .submitInquiry({
        name: this.strCustomerName,
        phone: this.strCustomerPhone,
        is_whatsapp: true,
        pickup_date: this.strTravelDate || undefined,
        message: strMsg,
      })
      .subscribe({
        next: () => {
          this.blnSubmitSuccess.set(true);
        },
      });

    const strWaUrl = this.siteSettingService.getWhatsappUrl(pkg?.whatsapp, strMsg);
    if (strWaUrl && typeof window !== 'undefined') {
      window.open(strWaUrl, '_blank');
    }
  }
}
