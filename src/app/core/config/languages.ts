export interface LanguageOption {
  code: 'en' | 'ar';
  label: string;
  direction: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', direction: 'ltr' },
  { code: 'ar', label: 'العربية', direction: 'rtl' },
];

export const DEFAULT_LANGUAGE: LanguageOption['code'] = 'en';
