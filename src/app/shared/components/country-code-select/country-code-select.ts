import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  HostListener,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
  computed,
  forwardRef,
  DestroyRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { InquiryService, CountryCode } from '../../../core/services/inquiry.service';

let nextUniqueId = 0;

@Component({
  selector: 'app-country-code-select',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './country-code-select.html',
  styleUrl: './country-code-select.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CountryCodeSelect),
      multi: true,
    },
  ],
})
export class CountryCodeSelect implements ControlValueAccessor, OnInit {
  private readonly inquiryService = inject(InquiryService);
  private readonly elementRef = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  /** Optional external country list override */
  @Input() set arrCodes(value: CountryCode[] | null | undefined) {
    if (value && value.length > 0) {
      this.arrCustomCodes.set(value);
    }
  }

  /** Optional custom styling for the trigger button */
  @Input() strButtonClass: string = '';

  /** Popover horizontal alignment */
  @Input() strAlign: 'left' | 'right' = 'left';

  /** Accessible label */
  @Input() strAriaLabel: string = '';

  @ViewChild('triggerBtnRef') private readonly triggerBtnRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('listboxRef') private readonly listboxRef?: ElementRef<HTMLDivElement>;

  protected readonly strListboxId = `rb-country-select-${++nextUniqueId}`;

  // Internal state
  private readonly arrCustomCodes = signal<CountryCode[] | null>(null);
  private readonly arrLoadedCodes = signal<CountryCode[]>([]);

  protected readonly arrCountryList = computed<CountryCode[]>(() => {
    const custom = this.arrCustomCodes();
    if (custom && custom.length > 0) return custom;
    const loaded = this.arrLoadedCodes();
    if (loaded && loaded.length > 0) return loaded;
    return [
      { code: 'AZ', name: 'Azerbaijan', dial_code: '+994', flag: '🇦🇿' },
      { code: 'AE', name: 'United Arab Emirates', dial_code: '+971', flag: '🇦🇪' },
      { code: 'SA', name: 'Saudi Arabia', dial_code: '+966', flag: '🇸🇦' },
      { code: 'QA', name: 'Qatar', dial_code: '+974', flag: '🇶🇦' },
      { code: 'KW', name: 'Kuwait', dial_code: '+965', flag: '🇰🇼' },
      { code: 'BH', name: 'Bahrain', dial_code: '+973', flag: '🇧🇭' },
      { code: 'OM', name: 'Oman', dial_code: '+968', flag: '🇴🇲' },
      { code: 'TR', name: 'Turkey', dial_code: '+90', flag: '🇹🇷' },
      { code: 'RU', name: 'Russia', dial_code: '+7', flag: '🇷🇺' },
      { code: 'US', name: 'United States', dial_code: '+1', flag: '🇺🇸' },
      { code: 'GB', name: 'United Kingdom', dial_code: '+44', flag: '🇬🇧' },
      { code: 'DE', name: 'Germany', dial_code: '+49', flag: '🇩🇪' },
    ];
  });

  protected readonly strCurrentDialCode = signal<string>('+994');
  protected readonly strSelectedIsoCode = signal<string>('AZ');
  protected readonly blnIsOpen = signal<boolean>(false);
  protected readonly blnOpenUpward = signal<boolean>(false);
  protected readonly blnDisabled = signal<boolean>(false);
  protected readonly numHighlightedIndex = signal<number>(0);

  protected readonly objCurrentCountry = computed<CountryCode | undefined>(() => {
    const list = this.arrCountryList();
    const iso = this.strSelectedIsoCode();
    const byIso = list.find((c) => c.code === iso);
    if (byIso) return byIso;
    const dial = this.strCurrentDialCode();
    return list.find((c) => c.dial_code === dial);
  });

  protected readonly strMergedButtonClass = computed(() => {
    if (this.strButtonClass) {
      return this.strButtonClass;
    }
    return 'w-full flex items-center justify-between gap-1.5 bg-[#0D0E12] border border-white/20 rounded-xl px-2.5 py-2.5 text-xs text-white focus:border-gold outline-none transition-colors cursor-pointer truncate';
  });

  // ControlValueAccessor callbacks
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    if (!this.arrCustomCodes()) {
      this.inquiryService
        .getCountryCodes()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((codes) => {
          if (codes && codes.length > 0) {
            this.arrLoadedCodes.set(codes);
            this.fnSyncIsoWithCurrentDial();
          }
        });
    }
  }

  // ControlValueAccessor Implementation
  writeValue(value: string | null | undefined): void {
    const dial = value || '+994';
    this.strCurrentDialCode.set(dial);

    // If currently selected country already has this dial_code, keep the selected ISO code!
    const current = this.objCurrentCountry();
    if (current && current.dial_code === dial) {
      return;
    }

    // Otherwise, resolve first country with this dial code
    const list = this.arrCountryList();
    if (dial === '+994') {
      this.strSelectedIsoCode.set('AZ');
    } else {
      const match = list.find((c) => c.dial_code === dial);
      if (match) {
        this.strSelectedIsoCode.set(match.code);
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.blnDisabled.set(isDisabled);
  }

  protected fnToggleDropdown(): void {
    if (this.blnDisabled()) return;

    if (this.blnIsOpen()) {
      this.fnCloseDropdown();
    } else {
      this.fnOpenDropdown();
    }
  }

  protected fnOpenDropdown(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.blnIsOpen.set(true);
      return;
    }

    // Determine upward vs downward positioning
    const btnElem = this.triggerBtnRef?.nativeElement;
    if (btnElem) {
      const rect = btnElem.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // If less than 270px below and more space above, open upward
      this.blnOpenUpward.set(spaceBelow < 270 && spaceAbove > 270);
    }

    // Set highlighted index to current selection
    const list = this.arrCountryList();
    const curIso = this.strSelectedIsoCode();
    const idx = list.findIndex((c) => c.code === curIso);
    this.numHighlightedIndex.set(idx >= 0 ? idx : 0);

    this.blnIsOpen.set(true);

    // Scroll into view on next tick
    setTimeout(() => {
      this.fnScrollHighlightedIntoView();
    }, 0);
  }

  protected fnCloseDropdown(): void {
    if (this.blnIsOpen()) {
      this.blnIsOpen.set(false);
      this.onTouched();
    }
  }

  protected fnSelectCountry(country: CountryCode): void {
    this.strSelectedIsoCode.set(country.code);
    this.strCurrentDialCode.set(country.dial_code);
    this.onChange(country.dial_code);
    this.fnCloseDropdown();
    if (isPlatformBrowser(this.platformId)) {
      this.triggerBtnRef?.nativeElement.focus();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.blnIsOpen()) return;

    const target = event.target as Node;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.fnCloseDropdown();
    }
  }

  protected fnOnKeydown(event: KeyboardEvent): void {
    const list = this.arrCountryList();
    if (!list.length) return;

    if (!this.blnIsOpen()) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        this.fnOpenDropdown();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.numHighlightedIndex.update((i) => Math.min(list.length - 1, i + 1));
        this.fnScrollHighlightedIntoView();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.numHighlightedIndex.update((i) => Math.max(0, i - 1));
        this.fnScrollHighlightedIntoView();
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        const highlighted = list[this.numHighlightedIndex()];
        if (highlighted) {
          this.fnSelectCountry(highlighted);
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.fnCloseDropdown();
        this.triggerBtnRef?.nativeElement.focus();
        break;

      case 'Tab':
        this.fnCloseDropdown();
        break;

      default:
        // Letter quick-jump
        if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
          const char = event.key.toLowerCase();
          const foundIdx = list.findIndex((c) => c.name.toLowerCase().startsWith(char));
          if (foundIdx >= 0) {
            this.numHighlightedIndex.set(foundIdx);
            this.fnScrollHighlightedIntoView();
          }
        }
        break;
    }
  }

  private fnScrollHighlightedIntoView(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const listbox = this.listboxRef?.nativeElement;
    if (!listbox) return;

    const list = this.arrCountryList();
    const active = list[this.numHighlightedIndex()];
    if (!active) return;

    const optionElem = listbox.querySelector(
      `[id="${this.strListboxId}-${active.code}"]`
    ) as HTMLElement | null;

    if (optionElem) {
      optionElem.scrollIntoView({ block: 'nearest' });
    }
  }

  private fnSyncIsoWithCurrentDial(): void {
    const current = this.objCurrentCountry();
    if (!current) {
      const dial = this.strCurrentDialCode();
      const list = this.arrCountryList();
      const match = list.find((c) => c.dial_code === dial);
      if (match) {
        this.strSelectedIsoCode.set(match.code);
      }
    }
  }
}
