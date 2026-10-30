import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AboutService } from '../../../core/services/about.service';
import { LanguageService } from '../../../core/services/language.service';
import { AboutPageData, LocalizedString } from '../../../core/models/about.model';
import { SiteSettingService } from '../../../core/services/site-setting.service';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-about-az',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './about-az.html',
  styleUrl: './about-az.css',
})
export class AboutAz implements OnInit {
  private readonly aboutService = inject(AboutService);
  protected readonly languageService = inject(LanguageService);
  protected readonly siteSettingService = inject(SiteSettingService);
  private readonly svcSog = inject(SeoService);

  // State Signals
  protected readonly objAboutData = signal<AboutPageData | null>(null);
  protected readonly blnLoading = signal<boolean>(true);

  // Dynamic social links matching footer implementation
  protected readonly arrSocialLinks = computed(() => {
    const settings = this.siteSettingService.objSiteSettingsSignal();
    const social = settings?.social_links;
    const links: { platform: string; label: string; url: string; color: string }[] = [];

    const instagramUrl =
      (social && typeof social === 'object' && social['instagram']) ||
      'https://instagram.com/royalbaku_car';
    links.push({
      platform: 'instagram',
      label: 'Instagram',
      url: instagramUrl,
      color: 'bg-pink-500',
    });

    const facebookUrl =
      (social && typeof social === 'object' && social['facebook']) ||
      'https://facebook.com';
    links.push({
      platform: 'facebook',
      label: 'Facebook',
      url: facebookUrl,
      color: 'bg-blue-500',
    });

    return links;
  });

  ngOnInit(): void {
    this.siteSettingService.getSiteSettings().subscribe();
    const isAz = this.languageService.strCurrentLang() === 'az';
    this.svcSog.fnSetSeo({
      title: isAz
        ? 'Haqqımızda | Royal Baku Rent A Car'
        : 'About Us | Royal Baku Car Rental',
      description: isAz
        ? 'Royal Baku Rent A Car haqqında məlumat. Bakıda lüks avtomobil icarəsi xidmətləri, missiyamız və komandamız.'
        : 'Learn about Royal Baku Car Rental, Baku\'s premier car rental provider offering luxury, sports, and economy vehicles.',
    });

    this.blnLoading.set(true);
    this.aboutService.getAboutData().subscribe({
      next: (data) => {
        this.objAboutData.set(data);
        this.blnLoading.set(false);
      },
      error: () => {
        this.blnLoading.set(false);
      },
    });
  }

  /**
   * Resolves a LocalizedString (dict or string) based on active language or falls back to English.
   */
  protected resolveText(value?: LocalizedString | null, fallback: string = ''): string {
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    const lang = this.languageService.strCurrentLang() || 'en';
    return value[lang] || value['en'] || value['az'] || value['ru'] || fallback;
  }
}
