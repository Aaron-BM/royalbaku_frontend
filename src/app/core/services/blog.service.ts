import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BlogPost, DRFBlogPost, DRFBlogPaginatedResponse } from '../../shared/models/blog-post.model';
import { LanguageService } from './language.service';
import { parseI18nString, parseMediaUrl } from '../utils/car-adapter';

// ---------------------------------------------------------------------------
// MOCK DATA FLAG
// Set USE_MOCK_DATA = false once the Django /api/blog/posts/ endpoint exists.
// ---------------------------------------------------------------------------
const USE_MOCK_DATA = true;

// ---------------------------------------------------------------------------
// Mock data — 6 posts for UI preview
// ---------------------------------------------------------------------------
const MOCK_POSTS: BlogPost[] = [
  {
    idPost: '1',
    strSlug: 'top-5-luxury-cars-baku-2025',
    strTitle: 'Top 5 Luxury Cars to Rent in Baku in 2025',
    strExcerpt:
      'From the Rolls-Royce Ghost to the Lamborghini Huracan, discover the most sought-after luxury rentals in Baku.',
    strContent:
      '<h2>Why Baku Demands Luxury</h2>' +
      '<p>The Caspian city has become a magnet for high-net-worth travellers, with sweeping boulevards perfect for supercar cruising.</p>' +
      '<h2>Our Top Picks</h2>' +
      '<ul>' +
      '<li><strong>Rolls-Royce Ghost</strong> - ultimate elegance for corporate events.</li>' +
      '<li><strong>Lamborghini Huracan</strong> - track-bred thrills on Baku streets.</li>' +
      '<li><strong>Bentley Continental GT</strong> - grand touring at its finest.</li>' +
      '<li><strong>Range Rover Autobiography</strong> - commanding presence for any occasion.</li>' +
      '<li><strong>Porsche 911 Cabriolet</strong> - open-air driving along the boulevard.</li>' +
      '</ul>' +
      '<p>Each vehicle is maintained to showroom standards and delivered 24/7 across Baku.</p>',
    strCoverImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80',
    strCategory: 'Luxury',
    strAuthor: 'Royal Baku Team',
    strPublishedAt: '2025-01-15T09:00:00Z',
    numReadingTime: 5,
    strMetaTitle: 'Top 5 Luxury Cars to Rent in Baku 2025 | Royal Baku Car Rental',
    strMetaDescription:
      'Discover the five most prestigious vehicles available to rent in Baku, from Rolls-Royce to Lamborghini.',
  },
  {
    idPost: '2',
    strSlug: 'baku-formula-1-car-rental-guide',
    strTitle: 'Your Complete Guide to Renting a Car During Baku F1 GP',
    strExcerpt:
      'The Formula 1 Baku Grand Prix turns Azerbaijan\'s capital into a racing paradise. Here is everything you need to know before booking.',
    strContent:
      '<h2>Book Early</h2>' +
      '<p>During the Baku F1 GP weekend the city sees a surge in visitors. We recommend booking your luxury rental at least <strong>7 days in advance</strong> to secure your preferred model.</p>' +
      '<h2>Best Routes</h2>' +
      '<p>The circuit snakes through the Old City. Cruise the same streets in the comfort of a Bentley or Mercedes.</p>' +
      '<blockquote><p>"Royal Baku delivered our Lamborghini to the hotel lobby - absolutely seamless." - F1 fan review</p></blockquote>' +
      '<h2>What We Offer</h2>' +
      '<p>24/7 delivery, zero deposit options, and a fleet of 100+ vehicles ready for race weekend.</p>',
    strCoverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    strCategory: 'Events',
    strAuthor: 'Royal Baku Team',
    strPublishedAt: '2025-03-20T10:30:00Z',
    numReadingTime: 4,
    strMetaTitle: 'Car Rental Guide for Baku F1 GP | Royal Baku Rent A Car',
    strMetaDescription:
      'Planning the Formula 1 Baku Grand Prix? Our complete guide covers everything for renting the perfect car for race weekend.',
  },
  {
    idPost: '3',
    strSlug: 'suv-road-trip-azerbaijan',
    strTitle: 'Best SUVs for an Azerbaijan Road Trip',
    strExcerpt:
      'Explore the Caucasus mountains, ancient fortresses and coastal highways in one of our premium SUVs.',
    strContent:
      '<h2>Adventure Awaits</h2>' +
      '<p>Azerbaijan\'s diverse terrain - from the Greater Caucasus to the Caspian coast - demands a capable, comfortable SUV.</p>' +
      '<h2>Our Recommended SUVs</h2>' +
      '<ul>' +
      '<li><strong>Range Rover Sport</strong> - combines off-road prowess with luxury.</li>' +
      '<li><strong>G-Class AMG 63</strong> - iconic ruggedness with supercar performance.</li>' +
      '<li><strong>Lamborghini Urus</strong> - the world\'s only super-SUV.</li>' +
      '</ul>' +
      '<h2>Route Suggestions</h2>' +
      '<p>Baku to Shamakhi to Sheki to Lagich - a 340 km loop through medieval silk-road history.</p>',
    strCoverImage: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&q=80',
    strCategory: 'Travel',
    strAuthor: 'Royal Baku Team',
    strPublishedAt: '2025-05-08T08:00:00Z',
    numReadingTime: 6,
    strMetaTitle: 'Best SUVs for an Azerbaijan Road Trip | Royal Baku Car Rental',
    strMetaDescription:
      'Planning a road trip across Azerbaijan? Discover the best SUVs to rent for mountain passes, coastal roads and cultural sites.',
  },
  {
    idPost: '4',
    strSlug: 'no-deposit-car-rental-baku',
    strTitle: 'Zero Deposit Car Rental in Baku - Is It Really Possible?',
    strExcerpt:
      'Yes, it is! Learn how Royal Baku offers certified deposit-free rentals on selected luxury and economy vehicles.',
    strContent:
      '<h2>What Zero Deposit Means</h2>' +
      '<p>Unlike traditional rentals that freeze large sums on your card, our zero-deposit policy means you pay only the rental rate.</p>' +
      '<h2>Eligible Vehicles</h2>' +
      '<p>Most of our fleet qualifies. A few ultra-high-value hypercars require a small refundable hold.</p>' +
      '<h2>How to Qualify</h2>' +
      '<ul>' +
      '<li>Must be 21+ years old.</li>' +
      '<li>Valid driving licence (home country or international).</li>' +
      '<li>Passport or national ID.</li>' +
      '</ul>' +
      '<p>Contact our concierge team via WhatsApp for instant confirmation.</p>',
    strCoverImage: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=80',
    strCategory: 'Tips',
    strAuthor: 'Royal Baku Team',
    strPublishedAt: '2025-06-01T11:00:00Z',
    numReadingTime: 3,
    strMetaTitle: 'Zero Deposit Car Rental in Baku | Royal Baku Rent A Car',
    strMetaDescription:
      'Find out how Royal Baku offers genuine deposit-free car rentals in Baku and what documents you need to qualify.',
  },
  {
    idPost: '5',
    strSlug: 'corporate-car-rental-baku',
    strTitle: 'Corporate Car Rental in Baku - A Guide for Business Travellers',
    strExcerpt:
      'From airport transfers to executive fleet management, Royal Baku is the preferred partner for corporate clients in Azerbaijan.',
    strContent:
      '<h2>Why Corporate Clients Choose Us</h2>' +
      '<p>Punctuality, discretion and an impeccable fleet - three qualities every business traveller demands.</p>' +
      '<h2>Services We Offer</h2>' +
      '<ul>' +
      '<li>Dedicated account manager.</li>' +
      '<li>Monthly invoicing available.</li>' +
      '<li>Chauffeur services for VIP clients.</li>' +
      '<li>24/7 concierge hotline.</li>' +
      '</ul>' +
      '<h2>Popular Models for Business</h2>' +
      '<p>The Mercedes S-Class, BMW 7 Series and Rolls-Royce Ghost are our most requested corporate vehicles.</p>',
    strCoverImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&q=80',
    strCategory: 'Business',
    strAuthor: 'Royal Baku Team',
    strPublishedAt: '2025-07-14T09:00:00Z',
    numReadingTime: 4,
    strMetaTitle: 'Corporate Car Rental Baku | Royal Baku Rent A Car',
    strMetaDescription:
      'Royal Baku provides premium corporate car rental solutions in Baku - from airport transfers to long-term executive fleet management.',
  },
  {
    idPost: '6',
    strSlug: 'convertible-rental-baku-boulevard',
    strTitle: 'Enjoy Baku Boulevard in a Convertible - The Ultimate Experience',
    strExcerpt:
      'Baku\'s beachfront boulevard stretches 3.75 km along the Caspian. Explore it with the top down in a Ferrari Roma Spider.',
    strContent:
      '<h2>The Boulevard</h2>' +
      '<p>The Baku Boulevard is a pedestrian and leisure promenade. Drive the parallel coastal road in an open-top sports car for an unforgettable experience.</p>' +
      '<h2>Best Convertibles Available</h2>' +
      '<ul>' +
      '<li>Ferrari Roma Spider</li>' +
      '<li>Porsche 911 Cabriolet</li>' +
      '<li>Lamborghini Huracan Spyder</li>' +
      '</ul>' +
      '<h2>Best Time to Drive</h2>' +
      '<p>Late spring and early autumn offer perfect temperatures - warm but not scorching - ideal for open-top motoring.</p>',
    strCoverImage: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=80',
    strCategory: 'Experience',
    strAuthor: 'Royal Baku Team',
    strPublishedAt: '2025-08-20T10:00:00Z',
    numReadingTime: 3,
    strMetaTitle: 'Convertible Rental Baku Boulevard | Royal Baku Car Rental',
    strMetaDescription:
      'Take a convertible along Baku Boulevard for the ultimate Caspian drive. Book a Ferrari, Porsche or Lamborghini Spider.',
  },
];

// ---------------------------------------------------------------------------
// Adapter: DRF model -> frontend BlogPost
// ---------------------------------------------------------------------------
function fnAdaptDRFPost(raw: DRFBlogPost, strLang: string): BlogPost {
  return {
    idPost: String(raw.id),
    strSlug: raw.slug,
    strTitle: parseI18nString(raw.title, strLang),
    strExcerpt: parseI18nString(raw.excerpt, strLang),
    strContent: parseI18nString(raw.content, strLang),
    strCoverImage: parseMediaUrl(raw.cover_image) || '',
    strCategory: raw.category || '',
    strAuthor: raw.author || '',
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
   * Fetches paginated blog posts, optionally filtered by category.
   * Returns mock data when USE_MOCK_DATA is true.
   */
  getPosts(numPage = 1, strCategory?: string): Observable<BlogPost[]> {
    const strLang = this.svcLanguage.strCurrentLang();

    if (USE_MOCK_DATA) {
      const arrFiltered = strCategory
        ? MOCK_POSTS.filter((p) => p.strCategory.toLowerCase() === strCategory.toLowerCase())
        : MOCK_POSTS;
      return of(arrFiltered);
    }

    let params = new HttpParams().set('page', String(numPage));
    if (strCategory) {
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
          console.warn('[BlogService] getPosts error:', error);
          return of([]);
        }),
      );
  }

  /**
   * Fetches a single blog post by slug.
   * Returns mock data when USE_MOCK_DATA is true.
   */
  getPostBySlug(strSlug: string): Observable<BlogPost | null> {
    const strLang = this.svcLanguage.strCurrentLang();

    if (USE_MOCK_DATA) {
      const objFound = MOCK_POSTS.find((p) => p.strSlug === strSlug) ?? null;
      return of(objFound);
    }

    return this.http.get<DRFBlogPost>(`${this.strApiBaseUrl}/${strSlug}/`).pipe(
      map((raw) => fnAdaptDRFPost(raw, strLang)),
      catchError((error) => {
        console.warn('[BlogService] getPostBySlug error:', error);
        return of(null);
      }),
    );
  }

  /**
   * Returns the latest N posts (used by blog-detail for the "latest posts" sidebar).
   */
  getLatestPosts(numCount = 3, strExcludeSlug?: string): Observable<BlogPost[]> {
    return this.getPosts(1).pipe(
      map((arrAll) => arrAll.filter((p) => p.strSlug !== strExcludeSlug).slice(0, numCount)),
    );
  }
}
