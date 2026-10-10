import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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

import { IconWhatsappComponent } from '../../shared/components/icons/icon-whatsapp';
import { IconPhoneComponent } from '../../shared/components/icons/icon-phone';

import { LangUrlPipe } from '../../shared/pipes/lang-url.pipe';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe, IconWhatsappComponent, IconPhoneComponent, LangUrlPipe],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer implements OnInit {
  protected readonly svcLanguage = inject(LanguageService);
  private readonly siteSettingService = inject(SiteSettingService);
  private readonly carService = inject(CarService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly intCurrentYear = signal<number>(new Date().getFullYear());

  protected readonly arrMainLinks = signal<FooterLink[]>([
    { strLabelKey: 'footer.ourCars', urlPath: '/cars' },
    { strLabelKey: 'footer.aboutUs', urlPath: '/about' },
    { strLabelKey: 'footer.contacts', urlPath: '/contact' },
    { strLabelKey: 'footer.rentalPrices', urlPath: '/prices' },
    { strLabelKey: 'footer.faqs', urlPath: '/faq' },
  ]);

  protected readonly arrCarTypeLinks = signal<FooterLink[]>([]);

  protected readonly strDefaultMapUrl =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d189.97907433905314!2d49.839537630506676!3d40.37194764453228!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40307dc067eb3d15%3A0xef92b6374df2a458!2sRoyal%20Baku%20Car%20Rental!5e0!3m2!1sen!2saz!4v1791614541792!5m2!1sen!2saz';

  protected readonly strRawMapUrl = signal<string>(this.strDefaultMapUrl);

  protected readonly safeMapUrl = computed<SafeResourceUrl>(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(this.strRawMapUrl())
  );

  protected readonly strAddressDisplay = signal<string>(
    'Khagani Mall, Office No: 09, 3rd Floor, Nizami St, Baku, Azerbaijan'
  );

  protected readonly mapDirectUrl = signal<string>(
    'https://maps.google.com/?q=Khagani+Mall,+Office+No:+09,+3rd+Floor,+Nizami+St,+Baku,+Azerbaijan'
  );

  protected readonly arrContactItems = signal<ContactInfoItem[]>([
    {
      idContact: 'address',
      strValue: 'Khagani Mall, Office No: 09, 3rd Floor, Nizami St, Baku, Azerbaijan',
      strIcon: 'location',
      urlHref: 'https://maps.google.com/?q=Khagani+Mall,+Office+No:+09,+3rd+Floor,+Nizami+St,+Baku,+Azerbaijan',
    },
  ]);

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

        // Update Google Maps embed link from backend
        if (settings.google_map_link && settings.google_map_link.trim()) {
          const cleanMapUrl = this.siteSettingService.getGoogleMapLink(settings.google_map_link);
          if (cleanMapUrl) {
            this.strRawMapUrl.set(cleanMapUrl);
          }
        }

        // Update address display and direct map URL
        const strLang = this.svcLanguage.strCurrentLang() || 'en';
        const strAddr = typeof settings.address === 'object'
          ? (settings.address[strLang] || settings.address['en'] || settings.address['az'] || '')
          : String(settings.address || '');
        const finalAddr = strAddr && strAddr.trim()
          ? strAddr.trim()
          : 'Khagani Mall, Office No: 09, 3rd Floor, Nizami St, Baku, Azerbaijan';
        this.strAddressDisplay.set(finalAddr);
        this.mapDirectUrl.set(`https://maps.google.com/?q=${encodeURIComponent(finalAddr)}`);

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

    const strAddr = typeof settings.address === 'object'
      ? (settings.address[strLang] || settings.address['en'] || settings.address['az'] || '')
      : String(settings.address || '');
    const finalAddr =
      strAddr && strAddr.trim()
        ? strAddr.trim()
        : 'Khagani Mall, Office No: 09, 3rd Floor, Nizami St, Baku, Azerbaijan';

    items.push({
      idContact: 'address',
      strValue: finalAddr,
      strIcon: 'location',
      urlHref: `https://maps.google.com/?q=${encodeURIComponent(finalAddr)}`,
    });

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
