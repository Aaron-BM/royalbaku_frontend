import { Component, Input, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../../../../core/services/language.service';
import { CarListFeature } from '../../../../../features/cars/models/car-list.model';
import { CarCategoryMeta } from '../../../../../core/models/car.model';
import { LangUrlPipe } from '../../../../../shared/pipes/lang-url.pipe';

@Component({
  selector: 'app-car-list-hero-az',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LangUrlPipe],
  templateUrl: './hero-az.html',
  styleUrl: './hero-az.css',
})
export class CarListHeroAz {
  protected readonly svcLanguage = inject(LanguageService);

  @Input() objCategoryMeta: CarCategoryMeta | null = null;

  protected readonly arrFeatures = signal<CarListFeature[]>([]);
}

