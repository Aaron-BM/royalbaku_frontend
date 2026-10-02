import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
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
  { path: '**', renderMode: RenderMode.Prerender },
];
