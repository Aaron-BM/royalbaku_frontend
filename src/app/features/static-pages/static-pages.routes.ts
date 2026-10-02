import { Routes } from '@angular/router';

/**
 * Routes owned by the Static Pages feature (About, FAQ, Contact, Prices, Monthly Rental).
 * Includes the pre-existing `/faqs` and `/rental-prices` path aliases.
 */
export const staticPagesRoutes: Routes = [
  {
    path: 'about',
    loadComponent: () => import('./about/about').then((m) => m.About),
  },
  {
    path: 'faq',
    loadComponent: () => import('./faq/faq').then((m) => m.Faq),
  },
  {
    path: 'faqs',
    loadComponent: () => import('./faq/faq').then((m) => m.Faq),
  },
  {
    path: 'contact',
    loadComponent: () => import('./contact/contact').then((m) => m.Contact),
  },
  {
    path: 'prices',
    loadComponent: () => import('./prices/prices').then((m) => m.Prices),
  },
  {
    path: 'rental-prices',
    loadComponent: () => import('./prices/prices').then((m) => m.Prices),
  },
];
