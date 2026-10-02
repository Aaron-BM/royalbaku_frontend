export interface LanguageOption {
  strCode: 'en' | 'az' | 'ar';
  strLabel: string;
  strDirection: 'ltr' | 'rtl';
  // Backward compatibility getters
  get code(): 'en' | 'az' | 'ar';
  get label(): string;
  get direction(): 'ltr' | 'rtl';
}

export const lstSupportedLanguages: LanguageOption[] = [
  {
    strCode: 'en',
    strLabel: 'English',
    strDirection: 'ltr',
    get code() { return this.strCode; },
    get label() { return this.strLabel; },
    get direction() { return this.strDirection; }
  },
  {
    strCode: 'az',
    strLabel: 'Azərbaycan',
    strDirection: 'ltr',
    get code() { return this.strCode; },
    get label() { return this.strLabel; },
    get direction() { return this.strDirection; }
  },
  {
    strCode: 'ar',
    strLabel: 'العربية',
    strDirection: 'rtl',
    get code() { return this.strCode; },
    get label() { return this.strLabel; },
    get direction() { return this.strDirection; }
  },
];

export const strDefaultLanguage: LanguageOption['strCode'] = 'en';
export const SUPPORTED_LANGUAGES = lstSupportedLanguages;
export const DEFAULT_LANGUAGE = strDefaultLanguage;

