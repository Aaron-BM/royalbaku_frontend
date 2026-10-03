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
    { strLabelKey: 'footer.ourCars', urlPath: '/cars/all' },
    { strLabelKey: 'footer.aboutUs', urlPath: '/about' },
    { strLabelKey: 'footer.contacts', urlPath: '/contact' },
    { strLabelKey: 'footer.rentalPrices', urlPath: '/prices' },
    { strLabelKey: 'footer.faqs', urlPath: '/faq' },
  ]);

  protected readonly arrCarTypeLinks = signal<FooterLink[]>([
    { strLabelKey: 'categories.luxury', urlPath: '/cars/luxury' },
    { strLabelKey: 'categories.sports', urlPath: '/cars/sports' },
    { strLabelKey: 'categories.suv', urlPath: '/cars/suv' },
    { strLabelKey: 'categories.economy', urlPath: '/cars/economy' },
    { strLabelKey: 'categories.exotic', urlPath: '/cars/exotic' },
    { strLabelKey: 'categories.convertible', urlPath: '/cars/convertible' },
  ]);

  protected readonly arrContactItems = signal<ContactInfoItem[]>([
    {
      idContact: 'phone',
      strValue: '+994 50 123 4567',
      strIcon: 'phone',
      urlHref: 'tel:+994501234567',
    },
    {
      idContact: 'whatsapp',
      strValue: '+994 10 235 7434',
      strIcon: 'whatsapp',
      urlHref: 'https://wa.me/994102357434',
    },
    {
      idContact: 'email',
      strValue: 'info@royalbakucar.com',
      strIcon: 'email',
      urlHref: 'mailto:info@royalbakucar.com',
    },
    {
      idContact: 'address',
      strTextKey: 'footer.addressText',
      strValue: 'Nizami Street, Baku, Azerbaijan',
      strIcon: 'location',
    },
    {
      idContact: 'hours',
      strTextKey: 'footer.service247',
      strValue: '',
      strIcon: 'clock',
    },
  ]);

  protected readonly arrBrands = signal<string[]>(['Mercedes-Benz', 'Kia', 'Rolls-Royce', 'Lamborghini', 'Ferrari', 'Porsche', 'BMW', 'Bentley']);

  protected readonly arrLocations = signal<string[]>([
    'Central Baku',
    'Heydar Aliyev Airport',
    'Baku Boulevard',
    'Port Baku',
    'Flame Towers',
    'Ganja',
    'Qabala',
    'Shahdag',
  ]);

  protected readonly arrSocialLinks = signal<SocialLink[]>([
    { idSocial: 'fb', strName: 'Facebook', strIcon: 'facebook', urlHref: 'https://facebook.com' },
    { idSocial: 'yt', strName: 'YouTube', strIcon: 'youtube', urlHref: 'https://youtube.com' },
    { idSocial: 'ig', strName: 'Instagram', strIcon: 'instagram', urlHref: 'https://instagram.com/royalbaku_car' },
    { idSocial: 'tt', strName: 'TikTok', strIcon: 'tiktok', urlHref: 'https://tiktok.com/@royalbaku' },
  ]);

  ngOnInit(): void {
    // Optionally override contact details with live backend site settings if configured
    this.siteSettingService.getSiteSettings().subscribe((settings) => {
      if (settings) {
        this.arrContactItems.update((items) =>
          items.map((item) => {
            if (item.idContact === 'phone' && settings.phone_number) {
              const url = this.siteSettingService.getPhoneUrl(settings.phone_number);
              return { ...item, strValue: settings.phone_number, urlHref: url || '' };
            }
            if (item.idContact === 'whatsapp' && settings.whatsapp_number) {
              const url = this.siteSettingService.getWhatsappUrl(settings.whatsapp_number);
              return { ...item, strValue: settings.whatsapp_number, urlHref: url || '' };
            }
            if (item.idContact === 'email' && settings.email) {
              return { ...item, strValue: settings.email, urlHref: `mailto:${settings.email}` };
            }
            return item;
          })
        );
      }
    });

    // Fetch brands dynamically from DRF backend API
    this.carService.getBrands().subscribe((backendBrands) => {
      if (backendBrands && backendBrands.length > 0) {
        this.arrBrands.set(backendBrands.map((b) => b.strName));
      }
    });
  }
}
