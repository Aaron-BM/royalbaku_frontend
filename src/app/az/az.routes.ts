import { Routes } from '@angular/router';

/**
 * Dedicated routes for all Azerbaijani (/az/...) pages.
 * Each route lazy loads the independent Azerbaijani component copy.
 */
export const azRoutes: Routes = [
  // 1. Home
  {
    path: '',
    loadComponent: () => import('./home/home-az').then((m) => m.HomeAz),
  },

  // 2. Cars Feature
  {
    path: 'cars',
    loadComponent: () => import('./cars/car-list/car-list-az').then((m) => m.CarListAz),
  },
  {
    path: 'cars/:category',
    loadComponent: () => import('./cars/car-list/car-list-az').then((m) => m.CarListAz),
  },
  {
    path: 'car/:slug',
    loadComponent: () => import('./cars/car-detail/car-detail-az').then((m) => m.CarDetailAz),
  },

  // 3. Tour Packages Feature
  {
    path: 'tour-packages',
    loadComponent: () =>
      import('./tour-packages/tour-packages-page/tour-packages-page-az').then(
        (m) => m.TourPackagesPageAz
      ),
  },
  {
    path: 'tours',
    loadComponent: () =>
      import('./tour-packages/tour-packages-page/tour-packages-page-az').then(
        (m) => m.TourPackagesPageAz
      ),
  },
  {
    path: 'tour-packages/discover-azerbaijan',
    loadComponent: () =>
      import('./tour-packages/tour-packages-page/tour-packages-page-az').then(
        (m) => m.TourPackagesPageAz
      ),
  },
  {
    path: 'tours/discover-azerbaijan',
    loadComponent: () =>
      import('./tour-packages/tour-packages-page/tour-packages-page-az').then(
        (m) => m.TourPackagesPageAz
      ),
  },
  {
    path: 'tour-packages/:slug',
    loadComponent: () =>
      import('./tour-packages/tour-packages-page/tour-packages-page-az').then(
        (m) => m.TourPackagesPageAz
      ),
  },

  // 4. Blog Feature
  {
    path: 'blog',
    loadComponent: () => import('./blog/blog-list/blog-list-az').then((m) => m.BlogListAz),
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./blog/blog-detail/blog-detail-az').then((m) => m.BlogDetailAz),
  },

  // 5. Static Pages Feature
  {
    path: 'about',
    loadComponent: () => import('./static-pages/about/about-az').then((m) => m.AboutAz),
  },
  {
    path: 'faq',
    loadComponent: () => import('./static-pages/faq/faq-az').then((m) => m.FaqAz),
  },
  {
    path: 'faqs',
    loadComponent: () => import('./static-pages/faq/faq-az').then((m) => m.FaqAz),
  },
  {
    path: 'contact',
    loadComponent: () => import('./static-pages/contact/contact-az').then((m) => m.ContactAz),
  },
  {
    path: 'prices',
    loadComponent: () => import('./static-pages/prices/prices-az').then((m) => m.PricesAz),
  },
  {
    path: 'rental-prices',
    loadComponent: () => import('./static-pages/prices/prices-az').then((m) => m.PricesAz),
  },

  // 6. 404 Route
  {
    path: '404',
    loadComponent: () =>
      import('./static-pages/not-found/not-found-az').then((m) => m.NotFoundAz),
  },

  // 7. Wildcard / Catch-All inside /az
  {
    path: '**',
    loadComponent: () =>
      import('./static-pages/not-found/not-found-az').then((m) => m.NotFoundAz),
  },
];

