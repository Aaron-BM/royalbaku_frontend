import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CarItem } from '../../../core/models/car.model';

@Component({
  selector: 'app-car-card',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './car-card.html',
  styleUrl: './car-card.css',
})
export class CarCard {
  @Input({ required: true }) objCar!: CarItem;
}
