import { Routes } from '@angular/router';

export const tourPackagesRoutes: Routes = [
  {
    path: 'tour-packages',
    loadComponent: () =>
      import('./tour-packages-page/tour-packages-page').then((m) => m.TourPackagesPage),
  },
  {
    path: 'tours',
    loadComponent: () =>
      import('./tour-packages-page/tour-packages-page').then((m) => m.TourPackagesPage),
  },
  {
    path: 'tour-packages/discover-azerbaijan',
    loadComponent: () =>
      import('./tour-packages-page/tour-packages-page').then((m) => m.TourPackagesPage),
  },
  {
    path: 'tours/discover-azerbaijan',
    loadComponent: () =>
      import('./tour-packages-page/tour-packages-page').then((m) => m.TourPackagesPage),
  },
  {
    path: 'tour-packages/:slug',
    loadComponent: () =>
      import('./tour-packages-page/tour-packages-page').then((m) => m.TourPackagesPage),
  },
];
