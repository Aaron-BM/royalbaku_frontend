import { Component, DestroyRef, OnInit, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { BlogService } from '../../../core/services/blog.service';
import { BlogPost } from '../../../shared/models/blog-post.model';
import { BlogCard } from '../../../shared/components/blog-card/blog-card';
import { SeoService } from '../../../core/services/seo.service';
import { LanguageService } from '../../../core/services/language.service';
import { LangUrlPipe } from '../../../shared/pipes/lang-url.pipe';

/** Categories derived from post list for the filter pills */
const ALL_CATEGORY_KEY = 'all';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, BlogCard, LangUrlPipe],
  templateUrl: './blog-list.html',
  styleUrl: './blog-list.css',
})
export class BlogList implements OnInit {
  protected readonly svcBlog = inject(BlogService);
  protected readonly svcSeo = inject(SeoService);
  protected readonly svcLanguage = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly arrAllPosts = signal<BlogPost[]>([]);
  protected readonly strActiveCategory = signal<string>(ALL_CATEGORY_KEY);
  protected readonly blnIsLoading = signal<boolean>(true);
  protected readonly blnHasError = signal<boolean>(false);

  /** Unique category list from loaded posts (includes an "All" option) */
  protected readonly arrCategories = computed<string[]>(() => {
    const arr = this.arrAllPosts();
    const arrUniq = Array.from(new Set(arr.map((p) => p.strCategory).filter(Boolean)));
    return [ALL_CATEGORY_KEY, ...arrUniq];
  });

  /** Filtered post list based on active category chip */
  protected readonly arrFilteredPosts = computed<BlogPost[]>(() => {
    const strCat = this.strActiveCategory();
    const arr = this.arrAllPosts();
    if (strCat === ALL_CATEGORY_KEY) return arr;
    return arr.filter((p) => p.strCategory === strCat);
  });

  /** Primary featured story (first post in the filtered list) */
  protected readonly objFeaturedPost = computed<BlogPost | null>(() => {
    const arr = this.arrFilteredPosts();
    return arr.length > 0 ? arr[0] : null;
  });

  /** Subsequent editorial stories */
  protected readonly arrRemainingPosts = computed<BlogPost[]>(() => {
    const arr = this.arrFilteredPosts();
    return arr.length > 1 ? arr.slice(1) : [];
  });

  protected fnFormatDate(strIso: string): string {
    if (!strIso) return '';
    try {
      const strLang = this.svcLanguage.strCurrentLang();
      return new Date(strIso).toLocaleDateString(strLang === 'az' ? 'az-AZ' : 'en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return strIso;
    }
  }

  constructor() {
    // Reactive SEO & automatic re-fetch on language switch
    effect(() => {
      const strLang = this.svcLanguage.strCurrentLang();
      const blnAz = strLang === 'az';
      this.svcSeo.fnSetSeo({
        title: blnAz
          ? 'Bloq | Royal Baku Rent A Car'
          : 'Blog — Car Rental Tips, Travel Guides & Baku News | Royal Baku',
        description: blnAz
          ? 'Royal Baku bloqunda avtomobil icarəsi məsləhətləri, Azərbaycan seyahət bələdçiləri və Bakı avtopark xəbərlərini kəşf edin.'
          : 'Read our latest articles on luxury car rentals in Baku, Azerbaijan travel tips, event guides, and more from the Royal Baku team.',
      });
      this.fnFetchPosts();
    });
  }

  ngOnInit(): void {}

  protected fnFetchPosts(): void {
    this.blnIsLoading.set(true);
    this.blnHasError.set(false);

    this.svcBlog
      .getPosts(1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (arrPosts) => {
          this.arrAllPosts.set(arrPosts);
          this.blnIsLoading.set(false);
        },
        error: () => {
          this.arrAllPosts.set([]);
          this.blnHasError.set(true);
          this.blnIsLoading.set(false);
        },
      });
  }

  protected fnSelectCategory(strCategory: string): void {
    this.strActiveCategory.set(strCategory);

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
