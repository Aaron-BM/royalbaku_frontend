import { Routes } from '@angular/router';

/**
 * Routes owned by the Blog feature.
 *
 * /blog        → BlogList (paginated list with category filter)
 * /blog/:slug  → BlogDetail (single post with Article JSON-LD)
 */
export const blogRoutes: Routes = [
  {
    path: 'blog',
    loadComponent: () => import('./blog-list/blog-list').then((m) => m.BlogList),
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./blog-detail/blog-detail').then((m) => m.BlogDetail),
  },
];
