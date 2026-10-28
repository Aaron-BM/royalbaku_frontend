import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-car-detail-skeleton',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './car-detail-skeleton.html',
  styleUrl: './car-detail-skeleton.css',
})
export class CarDetailSkeleton {}

