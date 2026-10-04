import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';
import { SiteSettingService } from '../../core/services/site-setting.service';
import { CarService } from '../../core/services/car.service';

export interface FooterLink {
  strLabelKey: string;
  urlPath: string;
}

export interface ContactInfoItem {
  idContact: string;
  strTextKey?: string;
  strValue: string;
  strIcon: string;
  urlHref?: string;
}

export interface SocialLink {
  idSocial: string;
  strName: string;
  strIcon: string;
  urlHref: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer implements OnInit {
  protected readonly svcLanguage = inject(LanguageService);
  private readonly siteSettingService = inject(SiteSettingService);
  private readonly carService = inject(CarService);

  protected readonly intCurrentYear = signal<number>(new Date().getFullYear());

  protected readonly arrMainLinks = signal<FooterLink[]>([
    { strLabelKey: 'footer.ourCars', urlPath: '/cars' },
    { strLabelKey: 'footer.aboutUs', urlPath: '/about' },
    { strLabelKey: 'footer.contacts', urlPath: '/contact' },
    { strLabelKey: 'footer.rentalPrices', urlPath: '/prices' },
    { strLabelKey: 'footer.faqs', urlPath: '/faq' },
  ]);

  protected readonly arrCarTypeLinks = signal<FooterLink[]>([]);

  protected readonly arrContactItems = signal<ContactInfoItem[]>([]);

  protected readonly arrBrands = signal<string[]>([]);

  protected readonly arrSocialLinks = signal<SocialLink[]>([
    { idSocial: 'fb', strName: 'Facebook', strIcon: 'facebook', urlHref: 'https://facebook.com' },
    { idSocial: 'yt', strName: 'YouTube', strIcon: 'youtube', urlHref: 'https://youtube.com' },
    { idSocial: 'ig', strName: 'Instagram', strIcon: 'instagram', urlHref: 'https://instagram.com/royalbaku_car' },
    { idSocial: 'tt', strName: 'TikTok', strIcon: 'tiktok', urlHref: 'https://tiktok.com/@royalbaku' },
  ]);

  ngOnInit(): void {
    // Populate contact items and social links dynamically from backend site settings
    this.siteSettingService.getSiteSettings().subscribe((settings) => {
      if (settings) {
        this.arrContactItems.set(this.buildContactItems(settings));

        if (settings.social_links && typeof settings.social_links === 'object') {
          const links: SocialLink[] = [];
          Object.entries(settings.social_links).forEach(([key, url]) => {
            if (url && typeof url === 'string') {
              links.push({
                idSocial: key,
                strName: key.charAt(0).toUpperCase() + key.slice(1),
                strIcon: key.toLowerCase(),
                urlHref: url,
              });
            }
          });
          if (links.length > 0) {
            this.arrSocialLinks.set(links);
          }
        }
      }
    });

    // Fetch brands dynamically from DRF backend API
    this.carService.getBrands().subscribe((backendBrands) => {
      if (backendBrands && backendBrands.length > 0) {
        this.arrBrands.set(backendBrands.map((b) => b.strName));
      }
    });

    // Fetch car categories dynamically from DRF backend API
    this.carService.getCategories().subscribe((backendCategories) => {
      if (backendCategories && backendCategories.length > 0) {
        const mappedLinks: FooterLink[] = backendCategories.map((cat) => ({
          strLabelKey: cat.strNameKey || `categories.${cat.strSlug}`,
          urlPath: `/cars/${cat.strSlug}`,
        }));
        this.arrCarTypeLinks.set(mappedLinks);
      }
    });
  }

  private buildContactItems(settings: any): ContactInfoItem[] {
    if (!settings) return [];

    const strLang = this.svcLanguage.strCurrentLang() || 'en';
    const items: ContactInfoItem[] = [];

    if (settings.phone_number) {
      items.push({
        idContact: 'phone',
        strValue: settings.phone_number,
        strIcon: 'phone',
        urlHref: this.siteSettingService.getPhoneUrl(settings.phone_number) || '',
      });
    }

    if (settings.whatsapp_number) {
      items.push({
        idContact: 'whatsapp',
        strValue: settings.whatsapp_number,
        strIcon: 'whatsapp',
        urlHref: this.siteSettingService.getWhatsappUrl(settings.whatsapp_number) || '',
      });
    }

    if (settings.email) {
      items.push({
        idContact: 'email',
        strValue: settings.email,
        strIcon: 'email',
        urlHref: `mailto:${settings.email}`,
      });
    }

    if (settings.address) {
      const strAddr = typeof settings.address === 'object'
        ? (settings.address[strLang] || settings.address['en'] || settings.address['az'] || '')
        : String(settings.address);
      if (strAddr) {
        items.push({
          idContact: 'address',
          strValue: strAddr,
          strIcon: 'location',
        });
      }
    }

    if (settings.working_hours) {
      const strHours = typeof settings.working_hours === 'object'
        ? (settings.working_hours[strLang] || settings.working_hours['en'] || settings.working_hours['az'] || '')
        : String(settings.working_hours);
      if (strHours) {
        items.push({
          idContact: 'hours',
          strValue: strHours,
          strIcon: 'clock',
        });
      }
    }

    return items;
  }
}
