import { Injectable, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { lstSupportedLanguages, strDefaultLanguage } from '../config/languages';
import enTranslations from '../../../../public/assets/i18n/en.json';
import azTranslations from '../../../../public/assets/i18n/az.json';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly svcTranslate = inject(TranslateService);
  strCurrentLang = signal<string>(strDefaultLanguage);
  lstLanguages = lstSupportedLanguages;

  // Backward compatibility getters
  get currentLang() { return this.strCurrentLang; }
  get languages() { return this.lstLanguages; }

  constructor() {
    this.svcTranslate.addLangs(lstSupportedLanguages.map((l) => l.strCode));
    this.svcTranslate.setFallbackLang(strDefaultLanguage);

    // Synchronously register fallback translations into TranslateService
    // to prevent Flash of Untranslated Content (FOUC) while HTTP requests load.
    this.svcTranslate.setTranslation('en', enTranslations, true);
    this.svcTranslate.setTranslation('az', azTranslations, true);
  }

  /**
   * Application initializer to ensure translation files are fully loaded
   * before Angular renders the root component view.
   */
  fnInitLanguage(): Promise<any> {
    const savedLang =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('app_lang') || strDefaultLanguage
        : strDefaultLanguage;

    this.strCurrentLang.set(savedLang);

    if (typeof document !== 'undefined') {
      document.documentElement.lang = savedLang;
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    }

    return firstValueFrom(this.svcTranslate.use(savedLang)).catch(() => null);
  }

  fnSetLanguage(strCode: string) {
    this.strCurrentLang.set(strCode);
    this.svcTranslate.use(strCode);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('app_lang', strCode);
    }

    if (typeof document !== 'undefined') {
      const objLang = lstSupportedLanguages.find((l) => l.strCode === strCode);
      document.documentElement.lang = strCode;
      document.documentElement.dir = objLang?.strDirection || (strCode === 'ar' ? 'rtl' : 'ltr');
    }
  }

  // Backward compatibility method
  setLanguage(strCode: string) {
    this.fnSetLanguage(strCode);
  }
}