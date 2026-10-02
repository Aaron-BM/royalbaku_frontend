import { Component, OnInit, inject, signal } from '@angular/core';
import { SiteSettingService } from '../../core/services/site-setting.service';

@Component({
  selector: 'app-floating-contact-buttons',
  standalone: true,
  imports: [],
  templateUrl: './floating-contact-buttons.html',
  styleUrl: './floating-contact-buttons.css',
})
export class FloatingContactButtons implements OnInit {
  private readonly siteSettingService = inject(SiteSettingService);

  protected readonly strWhatsappHref = signal<string | null>(null);
  protected readonly strPhoneHref = signal<string | null>(null);

  ngOnInit(): void {
    this.siteSettingService.getSiteSettings().subscribe((settings) => {
      if (settings) {
        this.strWhatsappHref.set(this.siteSettingService.getWhatsappUrl(settings.whatsapp_number));
        this.strPhoneHref.set(this.siteSettingService.getPhoneUrl(settings.phone_number));
      }
    });
  }
}
