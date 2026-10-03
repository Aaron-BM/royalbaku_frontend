import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-preview-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-preview-modal.html',
  styleUrl: './image-preview-modal.css',
})
export class ImagePreviewModal implements OnChanges, OnDestroy {
  @Input() strImageUrl: string | null = null;
  @Input() strAltText: string = '';
  @Input() blnIsOpen: boolean = false;

  @Output() closeModal = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['blnIsOpen']) {
      this.toggleScrollLock(this.blnIsOpen);
    }
  }

  ngOnDestroy(): void {
    this.toggleScrollLock(false);
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event): void {
    if (this.blnIsOpen) {
      event.preventDefault();
      this.onClose();
    }
  }

  protected onClose(): void {
    this.closeModal.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).hasAttribute('data-backdrop')) {
      this.onClose();
    }
  }

  private toggleScrollLock(lock: boolean): void {
    if (typeof document !== 'undefined') {
      if (lock) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }
}
