import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // English Routes
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'faq', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  { path: 'prices', renderMode: RenderMode.Prerender },
  { path: 'tour-packages', renderMode: RenderMode.Prerender },
  { path: 'tours', renderMode: RenderMode.Prerender },
  { path: 'tour-packages/discover-azerbaijan', renderMode: RenderMode.Prerender },
  { path: 'tours/discover-azerbaijan', renderMode: RenderMode.Prerender },
  { path: 'tour-packages/:slug', renderMode: RenderMode.Server },
  { path: 'cars/:category', renderMode: RenderMode.Server },
  { path: 'car/:slug', renderMode: RenderMode.Server },
  { path: '404', renderMode: RenderMode.Server, status: 404 },

  // Azerbaijani Routes
  { path: 'az', renderMode: RenderMode.Prerender },
  { path: 'az/about', renderMode: RenderMode.Prerender },
  { path: 'az/faq', renderMode: RenderMode.Prerender },
  { path: 'az/contact', renderMode: RenderMode.Prerender },
  { path: 'az/prices', renderMode: RenderMode.Prerender },
  { path: 'az/tour-packages', renderMode: RenderMode.Prerender },
  { path: 'az/tours', renderMode: RenderMode.Prerender },
  { path: 'az/tour-packages/discover-azerbaijan', renderMode: RenderMode.Prerender },
  { path: 'az/tours/discover-azerbaijan', renderMode: RenderMode.Prerender },
  { path: 'az/tour-packages/:slug', renderMode: RenderMode.Server },
  { path: 'az/cars/:category', renderMode: RenderMode.Server },
  { path: 'az/car/:slug', renderMode: RenderMode.Server },
  { path: 'az/404', renderMode: RenderMode.Server, status: 404 },

  // Wildcard Catch-All 404s
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
