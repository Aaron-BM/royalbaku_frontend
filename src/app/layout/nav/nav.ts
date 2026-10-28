import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { LanguageService } from '../../core/services/language.service';
import { CurrencyCode, CurrencyService } from '../../core/services/currency.service';
import { CarService } from '../../core/services/car.service';
import { CarBrand, CarCategory } from '../../core/models/car.model';
import { parseI18nString } from '../../core/utils/car-adapter';

import { LangUrlPipe } from '../../shared/pipes/lang-url.pipe';

type MenuId = 'types' | 'brands';

interface NavLink {
  strPath: string;
  strKey: string;
}

/** Hover intent: ignore quick mouse passes, forgive small cursor slips */
const NUM_HOVER_OPEN_DELAY_MS = 80;
const NUM_HOVER_CLOSE_DELAY_MS = 180;
const NUM_BRAND_COLUMNS = 4;

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe, LangUrlPipe],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav implements OnInit, AfterViewInit {
  protected readonly svcLanguage = inject(LanguageService);
  protected readonly svcCurrency = inject(CurrencyService);
  private readonly svcCar = inject(CarService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('navListRef') private readonly navListRef?: ElementRef<HTMLUListElement>;

  // ---------- Static data ----------
  protected readonly arrNavLinks: NavLink[] = [
    { strPath: '/tour-packages/discover-azerbaijan', strKey: 'nav.tourPackages' },
    { strPath: '/prices', strKey: 'nav.prices' },
    { strPath: '/blog', strKey: 'nav.blog' },
    { strPath: '/about', strKey: 'nav.aboutUs' },
    { strPath: '/faq', strKey: 'nav.faqs' },
    { strPath: '/contact', strKey: 'nav.contacts' },
  ];

  // ---------- Catalog data ----------
  private readonly objCatalogLookup = signal<any>({});

  protected readonly arrCarTypes = computed<CarCategory[]>(() => {
    const lookup = this.objCatalogLookup();
    const currentLang = this.svcLanguage.strCurrentLang();
    if (!lookup.categories?.length) return [];
    return [
      { idCategory: 'cat-0', strNameKey: 'hero.breadcrumbCategory', strSlug: '' },
      ...lookup.categories.map((objItem: any) => ({
        idCategory: String(objItem.id),
        strNameKey: parseI18nString(objItem.name, currentLang),
        strSlug: objItem.slug,
      })),
    ];
  });

  protected readonly arrCarBrands = computed<CarBrand[]>(() => {
    const lookup = this.objCatalogLookup();
    const currentLang = this.svcLanguage.strCurrentLang();
    return (lookup.brands ?? []).map((objItem: any) => ({
      idBrand: String(objItem.id),
      strName: parseI18nString(objItem.name, currentLang),
      strSlug: objItem.slug,
      strIconSvg: objItem.image || undefined,
    }));
  });

  /** Brands split evenly into columns for the desktop mega menu */
  protected readonly arrBrandColumns = computed<CarBrand[][]>(() => {
    const arrBrands = this.arrCarBrands();
    const numSize = Math.max(1, Math.ceil(arrBrands.length / NUM_BRAND_COLUMNS));
    return Array.from({ length: NUM_BRAND_COLUMNS }, (_, numIndex) =>
      arrBrands.slice(numIndex * numSize, (numIndex + 1) * numSize),
    );
  });

  // ---------- Menu state ----------
  protected readonly blnIsMobileMenuOpen = signal(false);
  private readonly strOpenMenu = signal<MenuId | null>(null);
  protected readonly blnIsCarTypesOpen = computed(() => this.strOpenMenu() === 'types');
  protected readonly blnIsCarBrandsOpen = computed(() => this.strOpenMenu() === 'brands');

  /** True when a click (not hover) opened the menu, so mouse-leave must not close it */
  private blnPinned = false;
  private numOpenTimer: ReturnType<typeof setTimeout> | null = null;
  private numCloseTimer: ReturnType<typeof setTimeout> | null = null;

  // ---------- Sliding indicator state ----------
  protected readonly strIndicatorX = signal('0px');
  protected readonly numIndicatorScaleX = signal(0);
  protected readonly blnIndicatorVisible = signal(false);

  // ---------- Scroll & Sticky state ----------
  protected readonly blnIsScrolled = signal(false);

  @HostListener('window:scroll')
  protected fnOnWindowScroll(): void {
    if (typeof window !== 'undefined') {
      this.blnIsScrolled.set(window.scrollY > 15);
    }
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.blnIsScrolled.set(window.scrollY > 15);
    }

    this.router.events
      .pipe(
        filter((objEvent) => objEvent instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.fnCloseDropdowns();
        this.fnCloseMobileMenu();
        setTimeout(() => this.fnUpdateActiveIndicator(), 50);
      });

    this.fnLoadCatalog();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.fnUpdateActiveIndicator(), 100);
  }

  // ==================== Catalog ====================

  private fnLoadCatalog(): void {
    this.svcCar
      .getCatalogLookup(['category', 'brand'])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((objLookup) => {
        this.objCatalogLookup.set(objLookup);
      });
  }

  // ==================== Dropdown menus ====================

  private fnCanHover(): boolean {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }

  private fnClearTimers(): void {
    if (this.numOpenTimer) clearTimeout(this.numOpenTimer);
    if (this.numCloseTimer) clearTimeout(this.numCloseTimer);
    this.numOpenTimer = this.numCloseTimer = null;
  }

  /** Mouse enters a dropdown item: open after a short intent delay, or switch instantly */
  protected fnOnMenuEnter(strMenu: MenuId): void {
    if (!this.fnCanHover()) return;
    this.fnClearTimers();

    const strCurrent = this.strOpenMenu();
    if (strCurrent === strMenu) return;

    if (strCurrent) {
      this.blnPinned = false;
      this.strOpenMenu.set(strMenu);
      return;
    }
    this.numOpenTimer = setTimeout(() => this.strOpenMenu.set(strMenu), NUM_HOVER_OPEN_DELAY_MS);
  }

  /** Mouse leaves: close after a grace period unless a click pinned the menu open */
  protected fnOnMenuLeave(): void {
    if (!this.fnCanHover()) return;
    this.fnClearTimers();
    if (this.blnPinned) return;
    this.numCloseTimer = setTimeout(() => this.strOpenMenu.set(null), NUM_HOVER_CLOSE_DELAY_MS);
  }

  /**
   * Click behaviour:
   *  - Desktop, opened by hover: first click pins it open, second click closes it.
   *  - Otherwise (closed, or touch device): click toggles.
   */
  protected fnToggleMenu(strMenu: MenuId): void {
    this.fnClearTimers();
    const blnIsOpen = this.strOpenMenu() === strMenu;

    if (blnIsOpen && this.fnCanHover() && !this.blnPinned) {
      this.blnPinned = true;
      return;
    }
    if (blnIsOpen) {
      this.fnCloseDropdowns();
      return;
    }
    this.blnPinned = true;
    this.strOpenMenu.set(strMenu);
  }

  protected fnCloseDropdowns(): void {
    this.fnClearTimers();
    this.blnPinned = false;
    this.strOpenMenu.set(null);
    setTimeout(() => this.fnUpdateActiveIndicator(), 50);
  }

  /** Close when focus leaves a dropdown item (keyboard users tabbing away) */
  protected fnOnMenuFocusOut(objEvent: FocusEvent, elItem: HTMLElement): void {
    const elNext = objEvent.relatedTarget as Node | null;
    if (elNext && elItem.contains(elNext)) return;
    if (!this.blnPinned) this.strOpenMenu.set(null);
  }

  @HostListener('document:click', ['$event'])
  protected fnOnDocumentClick(objEvent: MouseEvent): void {
    if (!this.strOpenMenu()) return;
    const elTarget = objEvent.target as HTMLElement | null;
    if (!elTarget?.closest('.nav-dropdown')) this.fnCloseDropdowns();
  }

  @HostListener('document:keydown.escape')
  protected fnOnEscape(): void {
    this.fnCloseDropdowns();
    this.fnCloseMobileMenu();
  }

  // ==================== Mobile menu ====================

  protected fnToggleMobileMenu(): void {
    this.blnIsMobileMenuOpen.update((blnPrev) => !blnPrev);
  }

  protected fnCloseMobileMenu(): void {
    this.blnIsMobileMenuOpen.set(false);
  }

  // ==================== Language ====================

  protected fnSetLanguage(strCode: string): void {
    this.svcLanguage.fnSetLanguage(strCode);
    setTimeout(() => this.fnUpdateActiveIndicator(), 150);
  }

  // ==================== Currency ====================

  protected fnSetCurrency(strCode: CurrencyCode): void {
    this.svcCurrency.fnSetCurrency(strCode);
  }

  // ==================== Sliding indicator ====================

  @HostListener('window:resize')
  protected fnOnResize(): void {
    this.fnUpdateActiveIndicator();
  }

  protected fnOnLinkHover(objEvent: Event): void {
    const elContainer = objEvent.currentTarget as HTMLElement | null;
    if (!elContainer) return;

    const elTarget = elContainer.classList.contains('nav-link-item')
      ? elContainer
      : ((elContainer.querySelector('.nav-link-item') as HTMLElement | null) ?? elContainer);

    this.fnPositionIndicator(elTarget);
  }

  protected fnOnNavMouseLeave(): void {
    this.fnUpdateActiveIndicator();
  }

  private fnPositionIndicator(elTarget: HTMLElement): void {
    if (
      typeof window === 'undefined' ||
      !elTarget ||
      typeof elTarget.getBoundingClientRect !== 'function'
    )
      return;
    const elList = this.navListRef?.nativeElement;
    if (!elList) return;

    const objTarget = elTarget.getBoundingClientRect();
    const objList = elList.getBoundingClientRect();

    this.strIndicatorX.set(`${objTarget.left - objList.left}px`);
    this.numIndicatorScaleX.set(objTarget.width);
    this.blnIndicatorVisible.set(true);
  }

  private fnUpdateActiveIndicator(): void {
    const elActive =
      this.navListRef?.nativeElement.querySelector<HTMLElement>('.nav-link-item.active');
    if (elActive) {
      this.fnPositionIndicator(elActive);
    } else {
      this.blnIndicatorVisible.set(false);
    }
  }
}
