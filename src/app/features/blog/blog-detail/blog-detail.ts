import {
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslatePipe } from '@ngx-translate/core';
import { BlogService } from '../../../core/services/blog.service';
import { BlogPost } from '../../../shared/models/blog-post.model';
import { BlogCard } from '../../../shared/components/blog-card/blog-card';
import { SeoService } from '../../../core/services/seo.service';
import { LanguageService } from '../../../core/services/language.service';
import { LangUrlPipe } from '../../../shared/pipes/lang-url.pipe';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [RouterLink, TranslatePipe, BlogCard, LangUrlPipe],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.css',
})
export class BlogDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly svcBlog = inject(BlogService);
  private readonly svcSeo = inject(SeoService);
  protected readonly svcLanguage = inject(LanguageService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly objPost = signal<BlogPost | null>(null);
  protected readonly arrLatestPosts = signal<BlogPost[]>([]);
  protected readonly blnIsLoading = signal<boolean>(true);
  protected readonly blnHasError = signal<boolean>(false);

  /** Sanitized post body HTML */
  protected readonly safeContent = computed<SafeHtml>(() => {
    const post = this.objPost();
    if (!post?.strContent) return '';
    return this.sanitizer.bypassSecurityTrustHtml(post.strContent);
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const strSlug = params.get('slug') || '';
      if (strSlug) {
        this.fnLoadPost(strSlug);
      }
    });
  }

  protected fnLoadPost(strSlug: string): void {
    this.blnIsLoading.set(true);
    this.blnHasError.set(false);

    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.svcBlog
      .getPostBySlug(strSlug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (post) => {
          if (post) {
            this.objPost.set(post);
            this.fnSetArticleSeo(post);
            this.fnLoadRelatedPosts(post.strSlug);
          } else {
            this.objPost.set(null);
            this.blnHasError.set(true);
          }
          this.blnIsLoading.set(false);
        },
        error: () => {
          this.objPost.set(null);
          this.blnHasError.set(true);
          this.blnIsLoading.set(false);
        },
      });
  }

  private fnLoadRelatedPosts(strCurrentSlug: string): void {
    this.svcBlog
      .getLatestPosts(3, strCurrentSlug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (arr) => this.arrLatestPosts.set(arr),
        error: () => this.arrLatestPosts.set([]),
      });
  }

  private fnSetArticleSeo(post: BlogPost): void {
    this.svcSeo.fnSetSeo({
      title: post.strMetaTitle || post.strTitle,
      description: post.strMetaDescription || post.strExcerpt,
      image: post.strCoverImage,
      type: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.strTitle,
        description: post.strExcerpt,
        image: post.strCoverImage,
        datePublished: post.strPublishedAt,
        author: {
          '@type': 'Organization',
          name: post.strAuthor || 'Royal Baku Rent A Car',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Royal Baku Rent A Car',
          logo: {
            '@type': 'ImageObject',
            url: `${this.svcSeo.strDomain}/assets/images/logo.png`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${this.svcSeo.strDomain}/blog/${post.strSlug}`,
        },
      },
    });
  }

  protected fnFormatDate(strIso: string): string {
    if (!strIso) return '';
    try {
      return new Date(strIso).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return strIso;
    }
  }
}

