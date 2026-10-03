import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourPackage } from '../../../../core/models/tour-package.model';
import { SiteSettingService } from '../../../../core/services/site-setting.service';
import { ImagePreviewModal } from '../../../../shared/components/image-preview-modal/image-preview-modal';

@Component({
  selector: 'app-tour-package-card',
  standalone: true,
  imports: [CommonModule, ImagePreviewModal],
  templateUrl: './tour-package-card.html',
  styleUrl: './tour-package-card.css',
})
export class TourPackageCard implements OnInit {
  @Input({ required: true }) objPackage!: TourPackage;
  @Input() blnIsExpanded = false;

  @Output() toggleExpand = new EventEmitter<void>();
  @Output() openInquiry = new EventEmitter<TourPackage>();

  private readonly siteSettingService = inject(SiteSettingService);

  protected readonly strPhoneHref = signal<string | null>(null);
  protected readonly strPhoneDisplay = signal<string>('');

  // Image Preview Lightbox Modal State
  protected readonly blnIsImageModalOpen = signal<boolean>(false);
  protected readonly strPreviewImageUrl = signal<string | null>(null);
  protected readonly strPreviewAltText = signal<string>('');

  ngOnInit(): void {
    this.siteSettingService.getSiteSettings().subscribe((settings) => {
      const rawPhone = this.objPackage?.phone || settings?.phone_number;
      this.strPhoneDisplay.set(rawPhone || '');
      this.strPhoneHref.set(this.siteSettingService.getPhoneUrl(rawPhone));
    });
  }

  protected onToggle(): void {
    this.toggleExpand.emit();
  }

  protected onBookNow(): void {
    this.openInquiry.emit(this.objPackage);
  }

  protected onWhatsApp(): void {
    const strText = `Hello Royal Baku, I would like to book/enquire about ${this.objPackage.title} (${this.objPackage.subtitle}).`;
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
}
