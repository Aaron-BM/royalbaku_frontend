import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { InquiryService } from '../../../core/services/inquiry.service';
import { SiteSettingService } from '../../../core/services/site-setting.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit {
  private readonly inquiryService = inject(InquiryService);
  private readonly siteSettingService = inject(SiteSettingService);

  protected readonly blnSubmitted = signal<boolean>(false);

  protected readonly strWhatsappHref = signal<string | null>(null);
  protected readonly strPhoneHref = signal<string | null>(null);
  protected readonly strPhoneNumberDisplay = signal<string>('');
  protected readonly strWhatsappNumberDisplay = signal<string>('');
  protected readonly strEmailDisplay = signal<string>('');

  protected readonly objFormData = signal({
    strName: '',
    strEmail: '',
    strCar: '',
    strPhone: '',
    strStartDate: '',
    strEndDate: '',
    strMessage: '',
  });

  ngOnInit(): void {
    this.siteSettingService.getSiteSettings().subscribe((settings) => {
      if (settings) {
        this.strPhoneNumberDisplay.set(settings.phone_number || '');
        this.strWhatsappNumberDisplay.set(settings.whatsapp_number || '');
        this.strEmailDisplay.set(settings.email || '');

        this.strWhatsappHref.set(this.siteSettingService.getWhatsappUrl(settings.whatsapp_number));
        this.strPhoneHref.set(this.siteSettingService.getPhoneUrl(settings.phone_number));
      }
    });
  }

  protected fnOnSubmit(): void {
    const data = this.objFormData();
    if (data.strName || data.strPhone) {
      this.blnSubmitted.set(true);

      this.inquiryService
        .submitInquiry({
          name: data.strName,
          phone: data.strPhone,
          is_whatsapp: false,
          pickup_date: data.strStartDate || undefined,
          dropoff_date: data.strEndDate || undefined,
          message: data.strMessage || (data.strEmail ? `Email: ${data.strEmail}` : undefined),
        })
        .subscribe({
          next: (res) => console.log('Contact inquiry submitted to backend:', res),
        });
    }
  }
}
