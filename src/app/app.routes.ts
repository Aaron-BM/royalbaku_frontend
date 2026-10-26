import { Routes } from '@angular/router';
import { homeRoutes } from './features/home/home.routes';
import { carsRoutes } from './features/cars/cars.routes';
import { staticPagesRoutes } from './features/static-pages/static-pages.routes';
import { tourPackagesRoutes } from './features/tour-packages/tour-packages.routes';
import { blogRoutes } from './features/blog/blog.routes';
import { azRoutes } from './az/az.routes';

const featureRoutes: Routes = [
  ...homeRoutes,
  ...carsRoutes,
  ...tourPackagesRoutes,
  ...blogRoutes,
  ...staticPagesRoutes,
  {
    path: '404',
    loadComponent: () =>
      import('./features/static-pages/not-found/not-found').then((m) => m.NotFound),
  },
];

export const routes: Routes = [
  // 1. English Routes (Default no-prefix)
  ...featureRoutes,

  // 2. Azerbaijani Routes (Nested under /az)
  {
    path: 'az',
    children: azRoutes,
  },

  // 3. Root Level Catch-All 404 Route
  {
    path: '**',
    loadComponent: () =>
      import('./features/static-pages/not-found/not-found').then((m) => m.NotFound),
  },
];
