import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AboutService } from '../../../core/services/about.service';
import { LanguageService } from '../../../core/services/language.service';
import { AboutPageData, LocalizedString } from '../../../core/models/about.model';

import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements OnInit {
  private readonly aboutService = inject(AboutService);
  protected readonly languageService = inject(LanguageService);
  private readonly svcSog = inject(SeoService);

  // State Signals
  protected readonly objAboutData = signal<AboutPageData | null>(null);
  protected readonly blnLoading = signal<boolean>(true);
  protected readonly strActiveTab = signal<'mission' | 'vision' | 'fleet'>('mission');

  ngOnInit(): void {
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

  protected fnSelectTab(strTab: 'mission' | 'vision' | 'fleet'): void {
    this.strActiveTab.set(strTab);
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
