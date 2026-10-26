import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  BlogPost,
  BlogBlock,
  DRFBlogPost,
  DRFBlogPaginatedResponse,
} from '../../shared/models/blog-post.model';
import { LanguageService } from './language.service';
import { parseI18nString, parseMediaUrl } from '../utils/car-adapter';

// ---------------------------------------------------------------------------
// Adapter: DRF model -> frontend BlogPost
// ---------------------------------------------------------------------------
function fnAdaptDRFPost(raw: DRFBlogPost, strLang: string): BlogPost {
  let strCategory = '';
  if (raw.category) {
    if (typeof raw.category === 'object') {
      strCategory = parseI18nString(raw.category.name, strLang);
    } else {
      strCategory = String(raw.category);
    }
  }

  const arrBlocks: BlogBlock[] = (raw.blocks || []).map((b: any): BlogBlock => {
    switch (b.type) {
      case 'heading':
        return {
          type: 'heading',
          level: b.level || 2,
          text: b.text || '',
        };
      case 'paragraph':
        return {
          type: 'paragraph',
          text: b.text || '',
        };
      case 'list':
        return {
          type: 'list',
          style: b.style || 'bullet',
          items: (b.items || []).map((it: any) => ({
            title: it.title || '',
            description: it.description || '',
          })),
        };
      case 'quote':
        return {
          type: 'quote',
          text: b.text || '',
          author: b.author || '',
        };
      case 'cta':
        return {
          type: 'cta',
          heading: b.heading || '',
          text: b.text || '',
          button_text: b.button_text || '',
          button_link: b.button_link || '/cars',
        };
      case 'image':
        return {
          type: 'image',
          image_url: b.image_url || '',
          caption: b.caption || '',
          alt: b.alt || '',
        };
      default:
        return {
          type: 'paragraph',
          text: String(b.text || ''),
        };
    }
  });

  return {
    idPost: String(raw.id),
    strSlug: raw.slug,
    strSlugEn: raw.slug_en || raw.slug,
    strSlugAz: raw.slug_az || raw.slug_en || raw.slug,
    strTitle: parseI18nString(raw.title, strLang),
    strExcerpt: parseI18nString(raw.excerpt, strLang),
    strContent: parseI18nString(raw.content, strLang),
    arrBlocks,
    strCoverImage: parseMediaUrl(raw.cover_image) || '',
    strCategory,
    strAuthor: raw.author || 'Royal Baku',
    strPublishedAt: raw.published_at || '',
    numReadingTime: raw.reading_time || 0,
    strMetaTitle: parseI18nString(raw.meta_title ?? '', strLang),
    strMetaDescription: parseI18nString(raw.meta_description ?? '', strLang),
  };
}


@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private readonly http = inject(HttpClient);
  private readonly svcLanguage = inject(LanguageService);
  private readonly strApiBaseUrl = `${environment.apiBaseUrl}/blog/posts`;

  /** Current posts list state (used by blog-list component) */
  readonly arrPosts = signal<BlogPost[]>([]);
  /** Currently viewed post detail state */
  readonly objCurrentPost = signal<BlogPost | null>(null);
  /** List loading state */
  readonly blnIsLoading = signal<boolean>(false);
  /** Detail loading state */
  readonly blnIsDetailLoading = signal<boolean>(false);
  /** List error state */
  readonly blnHasError = signal<boolean>(false);
  /** Detail error state */
  readonly blnHasDetailError = signal<boolean>(false);

  /**
   * Fetches paginated blog posts from Django REST backend, optionally filtered by category.
   * Sends active language code (?lang=en or ?lang=az).
   * Returns empty array if no data exists or upon network error (no dummy fallback).
   */
  getPosts(numPage = 1, strCategory?: string): Observable<BlogPost[]> {
    const strLang = this.svcLanguage.strCurrentLang();

    let params = new HttpParams().set('page', String(numPage)).set('lang', strLang);

    if (strCategory && strCategory.toLowerCase() !== 'all') {
      params = params.set('category', strCategory);
    }

    return this.http
      .get<DRFBlogPaginatedResponse | DRFBlogPost[]>(`${this.strApiBaseUrl}/`, { params })
      .pipe(
        map((res) => {
          const arrRaw: DRFBlogPost[] = Array.isArray(res)
            ? res
            : res && res.results
              ? res.results
              : [];
          return arrRaw.map((raw) => fnAdaptDRFPost(raw, strLang));
        }),
        catchError((error) => {
          console.warn('[BlogService] getPosts error (no backend data):', error);
          return of([]);
        }),
      );
  }

  /**
   * Fetches a single blog post by slug from Django REST backend.
   * Returns null if not found or upon error (no dummy fallback).
   */
  getPostBySlug(strSlug: string): Observable<BlogPost | null> {
    const strLang = this.svcLanguage.strCurrentLang();
    const params = new HttpParams().set('lang', strLang);

    return this.http.get<DRFBlogPost>(`${this.strApiBaseUrl}/${strSlug}/`, { params }).pipe(
      map((raw) => (raw ? fnAdaptDRFPost(raw, strLang) : null)),
      catchError((error) => {
        console.warn('[BlogService] getPostBySlug error (post not found):', error);
        return of(null);
      }),
    );
  }

  /**
   * Returns the latest N posts (used by blog-detail for the "latest posts" section).
   */
  getLatestPosts(numCount = 3, strExcludeSlug?: string): Observable<BlogPost[]> {
    return this.getPosts(1).pipe(
      map((arrAll) => arrAll.filter((p) => p.strSlug !== strExcludeSlug).slice(0, numCount)),
    );
  }
}
