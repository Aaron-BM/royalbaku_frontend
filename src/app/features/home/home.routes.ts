import { Routes } from '@angular/router';

/**
 * Routes owned by the Home feature.
 */
export const homeRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home').then((m) => m.Home),
  },
];
