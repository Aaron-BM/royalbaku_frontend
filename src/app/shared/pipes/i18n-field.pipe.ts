import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Pipe({ name: 'i18nField', pure: false })
export class I18nFieldPipe implements PipeTransform {
  private lang = inject(LanguageService);
  transform(value: Record<string, string> | undefined | null): string {
    if (!value) return '';
    const code = this.lang.currentLang();
    return value[code] ?? value[this.lang.languages[0].code] ?? '';
  }
}