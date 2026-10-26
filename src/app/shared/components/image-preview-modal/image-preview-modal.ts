import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
  PLATFORM_ID,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-image-preview-modal',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './image-preview-modal.html',
  styleUrl: './image-preview-modal.css',
})
export class ImagePreviewModal implements OnChanges, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  @Input() strImageUrl: string | null = null;
  @Input() strAltText: string = '';
  @Input() blnIsOpen: boolean = false;
  @Input() arrImages?: string[];
  @Input() numActiveIndex: number = 0;

  @Output() closeModal = new EventEmitter<void>();
  @Output() prevImage = new EventEmitter<void>();
  @Output() nextImage = new EventEmitter<void>();

  @ViewChild('closeBtn') closeBtnRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('modalBackdrop') modalBackdropRef?: ElementRef<HTMLDivElement>;

  private previousFocusedElement: HTMLElement | null = null;
  private isListenerAttached: boolean = false;

  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private isTouching: boolean = false;

  get hasMultipleImages(): boolean {
    return !!(this.arrImages && this.arrImages.length > 1);
  }

  get currentImageUrl(): string | null {
    if (this.arrImages && this.arrImages.length > 0) {
      const idx = Math.max(0, Math.min(this.numActiveIndex, this.arrImages.length - 1));
      return this.arrImages[idx] || this.strImageUrl;
    }
    return this.strImageUrl;
  }

  get currentAltText(): string {
    if (this.hasMultipleImages) {
      const total = this.arrImages!.length;
      const current = this.numActiveIndex + 1;
      return this.strAltText ? `${this.strAltText} (${current} / ${total})` : `Image ${current} of ${total}`;
    }
    return this.strAltText || 'Full screen preview';
  }

  getSlideAltText(index: number): string {
    if (this.hasMultipleImages) {
      const total = this.arrImages!.length;
      return this.strAltText ? `${this.strAltText} (${index + 1} / ${total})` : `Image ${index + 1} of ${total}`;
    }
    return this.strAltText || 'Full screen preview';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['blnIsOpen']) {
      if (this.blnIsOpen) {
        this.onModalOpen();
      } else {
        this.onModalClose();
      }
    }

    if (changes['numActiveIndex'] && !changes['numActiveIndex'].isFirstChange() && this.blnIsOpen) {
      this.preloadNeighbors();
    }
  }

  ngOnDestroy(): void {
    this.onModalClose();
  }

  private onModalOpen(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.previousFocusedElement = document.activeElement as HTMLElement | null;
    this.toggleScrollLock(true);
    this.attachKeydownListener();
    this.preloadNeighbors();

    // Focus close button on open
    setTimeout(() => {
      this.closeBtnRef?.nativeElement?.focus();
    }, 50);
  }

  private onModalClose(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.toggleScrollLock(false);
    this.detachKeydownListener();

    if (this.previousFocusedElement && typeof this.previousFocusedElement.focus === 'function') {
      this.previousFocusedElement.focus();
      this.previousFocusedElement = null;
    }
  }

  private attachKeydownListener(): void {
    if (this.isListenerAttached || !isPlatformBrowser(this.platformId)) return;
    window.addEventListener('keydown', this.handleKeydown);
    this.isListenerAttached = true;
  }

  private detachKeydownListener(): void {
    if (!this.isListenerAttached || !isPlatformBrowser(this.platformId)) return;
    window.removeEventListener('keydown', this.handleKeydown);
    this.isListenerAttached = false;
  }

  private handleKeydown = (event: KeyboardEvent): void => {
    if (!this.blnIsOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.onClose();
      return;
    }

    if (this.hasMultipleImages) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        this.onPrev();
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        this.onNext();
        return;
      }
    }

    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  };

  private trapFocus(event: KeyboardEvent): void {
    if (!this.modalBackdropRef?.nativeElement) return;
    const focusable = this.getFocusableElements(this.modalBackdropRef.nativeElement);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first || !focusable.includes(document.activeElement as HTMLElement)) {
        last.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === last || !focusable.includes(document.activeElement as HTMLElement)) {
        first.focus();
        event.preventDefault();
      }
    }
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
      (el) => el.offsetParent !== null
    );
  }

  protected onClose(): void {
    this.closeModal.emit();
  }

  protected onPrev(): void {
    if (this.hasMultipleImages) {
      this.prevImage.emit();
    }
  }

  protected onNext(): void {
    if (this.hasMultipleImages) {
      this.nextImage.emit();
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (
      target.hasAttribute('data-backdrop') ||
      target.classList.contains('modal-slider-slide') ||
      target.classList.contains('modal-slider-viewport') ||
      target.classList.contains('modal-backdrop')
    ) {
      this.onClose();
    }
  }

  protected onTouchStart(event: TouchEvent): void {
    if (!this.hasMultipleImages || event.touches.length !== 1) {
      this.isTouching = false;
      return;
    }
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.isTouching = true;
  }

  protected onTouchEnd(event: TouchEvent): void {
    if (!this.isTouching || event.changedTouches.length !== 1) {
      this.isTouching = false;
      return;
    }
    const deltaX = event.changedTouches[0].clientX - this.touchStartX;
    const deltaY = event.changedTouches[0].clientY - this.touchStartY;
    this.isTouching = false;

    // Ignore mostly vertical gestures
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    // 50px horizontal distance threshold
    if (deltaX > 50) {
      this.onPrev();
    } else if (deltaX < -50) {
      this.onNext();
    }
  }

  private preloadNeighbors(): void {
    if (!isPlatformBrowser(this.platformId) || !this.hasMultipleImages || !this.arrImages) {
      return;
    }
    const total = this.arrImages.length;
    const prevIdx = (this.numActiveIndex - 1 + total) % total;
    const nextIdx = (this.numActiveIndex + 1) % total;

    const prevUrl = this.arrImages[prevIdx];
    const nextUrl = this.arrImages[nextIdx];

    if (prevUrl) {
      const imgPrev = new Image();
      imgPrev.src = prevUrl;
    }
    if (nextUrl) {
      const imgNext = new Image();
      imgNext.src = nextUrl;
    }
  }

  private toggleScrollLock(lock: boolean): void {
    if (isPlatformBrowser(this.platformId) && typeof document !== 'undefined') {
      if (lock) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }
}
