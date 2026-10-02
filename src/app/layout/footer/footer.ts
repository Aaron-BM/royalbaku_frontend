import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';
import { SiteSettingService } from '../../core/services/site-setting.service';

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

  protected readonly intCurrentYear = signal<number>(new Date().getFullYear());

  protected readonly arrMainLinks = signal<FooterLink[]>([
    { strLabelKey: 'footer.ourCars', urlPath: '/cars/all' },
    { strLabelKey: 'footer.aboutUs', urlPath: '/about' },
    { strLabelKey: 'footer.blog', urlPath: '/blog' },
    { strLabelKey: 'footer.contacts', urlPath: '/contact' },
    { strLabelKey: 'footer.rentalPrices', urlPath: '/prices' },
    { strLabelKey: 'footer.privacyPolicy', urlPath: '/privacy-policy' },
    { strLabelKey: 'footer.rentalPolicy', urlPath: '/rental-policy' },
    { strLabelKey: 'footer.refundablePolicy', urlPath: '/refundable-policy' },
    { strLabelKey: 'footer.faqs', urlPath: '/faq' },
  ]);

  protected readonly arrCarTypeLinks = signal<FooterLink[]>([
    { strLabelKey: 'categories.luxury', urlPath: '/cars/luxury' },
    { strLabelKey: 'categories.sports', urlPath: '/cars/sports' },
    { strLabelKey: 'categories.suv', urlPath: '/cars/suv' },
    { strLabelKey: 'categories.economy', urlPath: '/cars/economy' },
    { strLabelKey: 'categories.exotic', urlPath: '/cars/exotic' },
    { strLabelKey: 'categories.convertible', urlPath: '/cars/convertible' },
    { strLabelKey: 'categories.weeklyRental', urlPath: '/weekly-rental' },
  ]);

  protected readonly arrContactItems = signal<ContactInfoItem[]>([
    {
      idContact: 'phone',
      strValue: '',
      strIcon: 'phone',
      urlHref: '',
    },
    {
      idContact: 'whatsapp',
      strValue: '',
      strIcon: 'whatsapp',
      urlHref: '',
    },
    {
      idContact: 'telegram',
      strValue: '',
      strIcon: 'telegram',
      urlHref: '',
    },
    {
      idContact: 'email',
      strValue: '',
      strIcon: 'email',
      urlHref: '',
    },
    {
      idContact: 'address',
      strTextKey: 'footer.addressText',
      strValue: '',
      strIcon: 'location',
    },
    {
      idContact: 'hours',
      strTextKey: 'footer.service247',
      strValue: '',
      strIcon: 'clock',
    },
  ]);

  protected readonly arrBrands = signal<string[]>([]);

  protected readonly arrLocations = signal<string[]>([]);

  protected readonly arrSocialLinks = signal<SocialLink[]>([
    { idSocial: 'fb', strName: 'Facebook', strIcon: 'facebook', urlHref: '' },
    { idSocial: 'yt', strName: 'YouTube', strIcon: 'youtube', urlHref: '' },
    { idSocial: 'ig', strName: 'Instagram', strIcon: 'instagram', urlHref: '' },
    { idSocial: 'gg', strName: 'Google', strIcon: 'google', urlHref: '' },
    { idSocial: 'tt', strName: 'TikTok', strIcon: 'tiktok', urlHref: '' },
    { idSocial: 'sc', strName: 'Snapchat', strIcon: 'snapchat', urlHref: '' },
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
  }
}
