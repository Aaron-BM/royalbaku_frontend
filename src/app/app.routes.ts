import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'cars/:category',
    loadComponent: () =>
      import('./features/cars/car-list').then((m) => m.CarList),
  },
  {
    path: 'car/:slug',
    loadComponent: () =>
      import('./features/car-detail/car-detail').then((m) => m.CarDetail),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/static-pages/about/about').then((m) => m.About),
  },
  {
    path: 'faq',
    loadComponent: () =>
      import('./features/static-pages/faq/faq').then((m) => m.Faq),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/static-pages/contact/contact').then((m) => m.Contact),
  },
  {
    path: 'monthly-rental',
    loadComponent: () =>
      import('./features/static-pages/monthly-rental/monthly-rental').then((m) => m.MonthlyRental),
  },
  {
    path: 'prices',
    loadComponent: () =>
      import('./features/static-pages/prices/prices').then((m) => m.Prices),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
