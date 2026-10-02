import { Routes } from '@angular/router';

/**
 * Routes owned by the Cars feature.
 *
 * NOTE: `/car/:slug` (singular) is the vehicle detail page and lives here
 * alongside `/cars` and `/cars/:category` because all three routes share
 * the same car domain (models, CarService, category metadata) — grouping
 * them here is what makes "which folder owns this URL" obvious.
 */
export const carsRoutes: Routes = [
  {
    path: 'cars',
    loadComponent: () => import('./car-list/car-list').then((m) => m.CarList),
  },
  {
    path: 'cars/:category',
    loadComponent: () => import('./car-list/car-list').then((m) => m.CarList),
  },
  {
    path: 'car/:slug',
    loadComponent: () => import('./car-detail/car-detail').then((m) => m.CarDetail),
  },
];
