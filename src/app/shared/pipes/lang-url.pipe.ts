import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Pipe({
  name: 'langUrl',
  standalone: true,
  pure: false,
})
export class LangUrlPipe implements PipeTransform {
  private readonly svcLanguage = inject(LanguageService);

  transform(value: string | any[] | null | undefined): any[] {
    return this.svcLanguage.fnLangRoute(value);
  }
}
