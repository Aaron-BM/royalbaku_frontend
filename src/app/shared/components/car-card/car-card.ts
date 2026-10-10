import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CarItem } from '../../../core/models/car.model';
import { SiteSettingService } from '../../../core/services/site-setting.service';

import { AppCurrencyPipe } from '../../pipes/app-currency.pipe';
import { IconWhatsappComponent } from '../icons/icon-whatsapp';

import { LangUrlPipe } from '../../pipes/lang-url.pipe';

@Component({
  selector: 'app-car-card',
  standalone: true,
  imports: [RouterLink, TranslatePipe, AppCurrencyPipe, IconWhatsappComponent, LangUrlPipe],
  templateUrl: './car-card.html',
  styleUrl: './car-card.css',
})
export class CarCard {
  @Input({ required: true }) objCar!: CarItem;

  protected readonly siteSettingService = inject(SiteSettingService);

  protected get strWhatsappHref(): string | null {
    const strMsg = `Hello Royal Baku, I am interested in renting ${this.objCar?.strTitle || 'a car'}.`;
    return this.siteSettingService.getWhatsappUrl(this.objCar?.strWhatsappNumber, strMsg);
  }
}
