import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourPackage } from '../../../../core/models/tour-package.model';
import { SiteSettingService } from '../../../../core/services/site-setting.service';
import { ImagePreviewModal } from '../../../../shared/components/image-preview-modal/image-preview-modal';
import { IconWhatsappComponent } from '../../../../shared/components/icons/icon-whatsapp';
import { IconPhoneComponent } from '../../../../shared/components/icons/icon-phone';
import { AppCurrencyPipe } from '../../../../shared/pipes/app-currency.pipe';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-tour-package-card-az',
  standalone: true,
  imports: [CommonModule, ImagePreviewModal, IconWhatsappComponent, IconPhoneComponent, AppCurrencyPipe, TranslatePipe],
  templateUrl: './tour-package-card-az.html',
  styleUrl: './tour-package-card-az.css',
})
export class TourPackageCardAz implements OnInit {
  @Input({ required: true }) objPackage!: TourPackage;
  @Input() blnIsExpanded = false;

  @Output() toggleExpand = new EventEmitter<void>();
  @Output() openInquiry = new EventEmitter<TourPackage>();

  private readonly siteSettingService = inject(SiteSettingService);

  protected readonly strPhoneHref = signal<string | null>(null);
  protected readonly strPhoneDisplay = signal<string>('');
  protected readonly strWhatsappHref = signal<string | null>(null);
  protected readonly strWhatsappDisplay = signal<string>('');

  // Image Preview Lightbox Modal State
  protected readonly blnIsImageModalOpen = signal<boolean>(false);
  protected readonly strPreviewImageUrl = signal<string | null>(null);
  protected readonly strPreviewAltText = signal<string>('');

  ngOnInit(): void {
    this.siteSettingService.getSiteSettings().subscribe((settings) => {
      const rawPhone = this.objPackage?.phone || settings?.phone_number;
      const rawWa = this.objPackage?.whatsapp || settings?.whatsapp_number;
      const persons = this.numPersons;
      this.strPhoneDisplay.set(rawPhone || '');
      this.strPhoneHref.set(this.siteSettingService.getPhoneUrl(rawPhone));
      this.strWhatsappDisplay.set(rawWa || '');
      this.strWhatsappHref.set(
        this.siteSettingService.getWhatsappUrl(
          rawWa,
          `Hello Royal Baku, I would like to book/enquire about ${this.objPackage.title} (${this.objPackage.subtitle}) for ${persons} persons.`
        )
      );
    });
  }

  protected get numPersons(): number {
    return this.objPackage?.numberOfPersons || this.objPackage?.number_of_persons || 1;
  }

  protected onToggle(): void {
    this.toggleExpand.emit();
  }

  protected onBookNow(): void {
    this.openInquiry.emit(this.objPackage);
  }

  protected onWhatsApp(): void {
    const strText = `Hello Royal Baku, I would like to book/enquire about ${this.objPackage.title} (${this.objPackage.subtitle}) for ${this.numPersons} persons.`;
    const strWaUrl = this.siteSettingService.getWhatsappUrl(this.objPackage?.whatsapp, strText);
    if (strWaUrl && typeof window !== 'undefined') {
      window.open(strWaUrl, '_blank');
    }
  }

  protected openPreviewModal(strUrl: string, strAlt: string = ''): void {
    this.strPreviewImageUrl.set(strUrl);
    this.strPreviewAltText.set(strAlt);
    this.blnIsImageModalOpen.set(true);
  }

  protected closePreviewModal(): void {
    this.blnIsImageModalOpen.set(false);
    this.strPreviewImageUrl.set(null);
  }

  get previewStops() {
    return this.objPackage?.stops?.slice(0, 4) || [];
  }

  get remainingStopsCount() {
    const total = this.objPackage?.stops?.length || 0;
    return Math.max(0, total - 4);
  }

  get coverImageUrl(): string | null {
    if (!this.objPackage || !this.objPackage.stops || this.objPackage.stops.length === 0) return null;
    const stop1 = this.objPackage.stops.find((s) => s.order === 1);
    const img = stop1?.image || this.objPackage.stops[0]?.image;
    return img && img.trim().length > 0 ? img : null;
  }
}
