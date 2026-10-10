import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TourPackageService } from '../../../core/services/tour-package.service';
import { TourPackage } from '../../../core/models/tour-package.model';
import { TourPackageCard } from '../components/tour-package-card/tour-package-card';
import { InquiryService } from '../../../core/services/inquiry.service';
import { SiteSettingService } from '../../../core/services/site-setting.service';

import { SeoService } from '../../../core/services/seo.service';
import { LanguageService } from '../../../core/services/language.service';

import { LangUrlPipe } from '../../../shared/pipes/lang-url.pipe';

import { IconWhatsappComponent } from '../../../shared/components/icons/icon-whatsapp';
import { IconPhoneComponent } from '../../../shared/components/icons/icon-phone';

@Component({
  selector: 'app-tour-packages-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TourPackageCard, IconWhatsappComponent, IconPhoneComponent, LangUrlPipe],
  templateUrl: './tour-packages-page.html',
  styleUrl: './tour-packages-page.css',
})
export class TourPackagesPage implements OnInit {
  private readonly tourService = inject(TourPackageService);
  private readonly inquiryService = inject(InquiryService);
  private readonly siteSettingService = inject(SiteSettingService);
  private readonly route = inject(ActivatedRoute);
  private readonly svcSog = inject(SeoService);
  private readonly svcLanguage = inject(LanguageService);

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
    const isAz = this.svcLanguage.strCurrentLang() === 'az';
    this.svcSog.fnSetSeo({
      title: isAz
        ? 'Tur Paketləri və Şəxsi Sürücü Xidməti | Royal Baku Rent A Car'
        : 'Private Tour Packages in Azerbaijan | Royal Baku Car Rental',
      description: isAz
        ? 'Bakı, Qəbələ, Quba və Şahdağ üzrə lüks avtomobil və şəxsi sürücü ilə fərdi tur paketləri.'
        : 'Explore Azerbaijan with our VIP private tour packages and professional driver service across Baku, Gabala, Shahdag, and Shahdag.',
    });

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
        const arrList = pkgs || [];
        this.arrPackages.set(arrList);
        this.blnIsLoading.set(false);

        // Process route params once packages are loaded
        this.handleRouteParams(arrList);
      },
      error: () => {
        this.arrPackages.set([]);
        this.blnIsLoading.set(false);
      },
    });

    // Subscribe to paramMap to dynamically update when slug changes (e.g., navigating between details pages)
    this.route.paramMap.subscribe((paramMap) => {
      if (!this.blnIsLoading()) {
        this.handleRouteParams(this.arrPackages());
      }
    });

    // Also support query param `?package=slug` or `?slug=slug`
    this.route.queryParamMap.subscribe(() => {
      if (!this.blnIsLoading()) {
        this.handleRouteParams(this.arrPackages());
      }
    });
  }

  private handleRouteParams(pkgs: TourPackage[]): void {
    if (!pkgs || pkgs.length === 0) return;

    const strSlug =
      this.route.snapshot.paramMap.get('slug') ||
      this.route.snapshot.queryParamMap.get('package') ||
      this.route.snapshot.queryParamMap.get('slug');

    if (strSlug) {
      const matched = pkgs.find(
        (p) => p.slug?.toLowerCase() === strSlug.toLowerCase() || p.id?.toLowerCase() === strSlug.toLowerCase()
      );
      if (matched) {
        // Hard reset accordion: expand ONLY matched package
        this.strExpandedId.set(matched.id);
        this.scrollToPackage(matched.slug || matched.id);
      } else {
        // Fallback if slug doesn't match any package: expand first package by default
        this.strExpandedId.set(pkgs[0].id);
      }
    } else {
      // Default state when no slug in URL: expand first package
      this.strExpandedId.set(pkgs[0].id);
    }
  }

  private scrollToPackage(strSlugOrId: string): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Small delay ensures Angular DOM has rendered the expanded card height
    setTimeout(() => {
      const elemCard =
        document.getElementById(`pkg-${strSlugOrId}`) ||
        document.getElementById(strSlugOrId);

      if (elemCard) {
        elemCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
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
    const pkgTitle = pkg ? (typeof pkg.title === 'string' ? pkg.title : (pkg.title as any)?.en || pkg.subtitle || '') : '';

    this.inquiryService
      .submitInquiry({
        type: 'tour',
        name: this.strCustomerName,
        phone: this.strCustomerPhone,
        is_whatsapp: true,
        tour_package: pkg?.slug || pkg?.id || null,
        tour_package_title: pkgTitle || undefined,
        pickup_date: this.strTravelDate || undefined,
        message: this.strSpecialRequest || undefined,
      })
      .subscribe({
        next: () => {
          this.blnSubmitSuccess.set(true);
        },
      });
  }
}
