import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../config/languages';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  currentLang = signal<string>(DEFAULT_LANGUAGE);
  languages = SUPPORTED_LANGUAGES;

  constructor(private translate: TranslateService) {
    this.translate.addLangs(SUPPORTED_LANGUAGES.map(l => l.code));
    this.translate.setFallbackLang(DEFAULT_LANGUAGE);
  }

  setLanguage(code: string) {
    this.currentLang.set(code);
    this.translate.use(code);
    document.documentElement.lang = code; // still update for accessibility/SEO
    // no dir flip — layout stays LTR regardless of language
  }
}