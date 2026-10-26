import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../../../../core/services/language.service';
import { CarCategoryMeta } from '../../../../../core/models/car.model';

import { LangUrlPipe } from '../../../../../shared/pipes/lang-url.pipe';

@Component({
  selector: 'app-car-list-hero',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LangUrlPipe],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class CarListHero {
  protected readonly svcLanguage = inject(LanguageService);

  @Input() objCategoryMeta: CarCategoryMeta | null = null;
}
