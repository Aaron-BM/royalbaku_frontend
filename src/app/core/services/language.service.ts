import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter, firstValueFrom } from 'rxjs';
import { lstSupportedLanguages, strDefaultLanguage } from '../config/languages';
import enTranslations from '../../../../public/assets/i18n/en.json';
import azTranslations from '../../../../public/assets/i18n/az.json';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly svcTranslate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  strCurrentLang = signal<string>(strDefaultLanguage);
  lstLanguages = lstSupportedLanguages;

  get currentLang() {
    return this.strCurrentLang;
  }
  get languages() {
    return this.lstLanguages;
  }

  constructor() {
    this.svcTranslate.addLangs(lstSupportedLanguages.map((l) => l.strCode));
    this.svcTranslate.setFallbackLang(strDefaultLanguage);

    // Register fallback translations synchronously to avoid FOUC
    this.svcTranslate.setTranslation('en', enTranslations, true);
    this.svcTranslate.setTranslation('az', azTranslations, true);

    // Listen to route changes to keep active language strictly in sync with URL
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.fnSyncLanguageFromUrl(event.urlAfterRedirects || event.url);
      });
  }

  /**
   * Initializes language based strictly on the current URL path.
   */
  fnInitLanguage(): Promise<any> {
    let currentUrl = '';
    if (typeof window !== 'undefined') {
      currentUrl = window.location.pathname;
    } else {
      currentUrl = this.router.url || '';
    }

    const targetLang = this.fnGetLangFromUrl(currentUrl);
    return this.fnApplyLanguage(targetLang);
  }

  /**
   * Evaluates if a given URL belongs to Azerbaijani ('az') or English ('en').
   */
  fnGetLangFromUrl(url: string): string {
    const cleanPath = url.split('?')[0].split('#')[0];
    if (cleanPath === '/az' || cleanPath.startsWith('/az/')) {
      return 'az';
    }
    return 'en';
  }

  /**
   * Syncs internal signals and ngx-translate state with the given URL path.
   */
  fnSyncLanguageFromUrl(url: string): void {
    const detectedLang = this.fnGetLangFromUrl(url);
    if (detectedLang !== this.strCurrentLang()) {
      this.fnApplyLanguage(detectedLang);
    }
  }

  /**
   * Applies language state to signal, ngx-translate, document root element, and localStorage.
   */
  private fnApplyLanguage(strCode: string): Promise<any> {
    const validatedLang = strCode === 'az' ? 'az' : 'en';
    this.strCurrentLang.set(validatedLang);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('app_lang', validatedLang);
    }

    if (typeof document !== 'undefined') {
      const objLang = lstSupportedLanguages.find((l) => l.strCode === validatedLang);
      document.documentElement.lang = validatedLang;
      document.documentElement.dir = objLang?.strDirection || 'ltr';
    }

    return firstValueFrom(this.svcTranslate.use(validatedLang)).catch(() => null);
  }

  /**
   * Converts any router path into a language-aware route array.
   * e.g., '/cars' -> ['/az', 'cars'] when active language is 'az'.
   */
  fnLangRoute(pathInput: string | any[] | null | undefined): any[] {
    if (!pathInput) {
      return this.strCurrentLang() === 'az' ? ['/az'] : ['/'];
    }

    let segments: string[] = [];
    if (typeof pathInput === 'string') {
      if (pathInput === '/' || pathInput === '') {
        return this.strCurrentLang() === 'az' ? ['/az'] : ['/'];
      }
      segments = pathInput.split('/').filter(Boolean);
    } else if (Array.isArray(pathInput)) {
      segments = pathInput
        .flatMap((item) => (typeof item === 'string' ? item.split('/') : item))
        .filter(Boolean);
    }

    // Remove existing leading 'az' if present in segment list to normalize
    if (segments.length > 0 && segments[0] === 'az') {
      segments.shift();
    }

    if (this.strCurrentLang() === 'az') {
      return ['/az', ...segments];
    } else {
      return ['/', ...segments];
    }
  }

  /**
   * Toggles language between 'en' and 'az' by navigating to the equivalent path.
   */
  fnSetLanguage(strCode: string): void {
    const targetLang = strCode === 'az' ? 'az' : 'en';
    const currentUrl = this.router.url || '/';
    const currentCleanPath = currentUrl.split('?')[0].split('#')[0];
    const queryParamsString = currentUrl.includes('?') ? '?' + currentUrl.split('?')[1] : '';

    let strippedPath = currentCleanPath;
    if (strippedPath === '/az') {
      strippedPath = '/';
    } else if (strippedPath.startsWith('/az/')) {
      strippedPath = strippedPath.substring(3);
    }

    let targetUrl = '';
    if (targetLang === 'az') {
      targetUrl = strippedPath === '/' ? '/az' : '/az' + strippedPath;
    } else {
      targetUrl = strippedPath === '' ? '/' : strippedPath;
    }

    targetUrl += queryParamsString;

    this.fnApplyLanguage(targetLang);
    this.router.navigateByUrl(targetUrl);
  }

  // Backward compatibility method
  setLanguage(strCode: string) {
    this.fnSetLanguage(strCode);
  }
}