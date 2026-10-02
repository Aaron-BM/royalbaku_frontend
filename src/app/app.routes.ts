import { Routes } from '@angular/router';
import { homeRoutes } from './features/home/home.routes';
import { carsRoutes } from './features/cars/cars.routes';
import { staticPagesRoutes } from './features/static-pages/static-pages.routes';
import { tourPackagesRoutes } from './features/tour-packages/tour-packages.routes';

export const routes: Routes = [
  ...homeRoutes,
  ...carsRoutes,
  ...tourPackagesRoutes,
  ...staticPagesRoutes,
  {
    path: '**',
    redirectTo: '',
  },
];

