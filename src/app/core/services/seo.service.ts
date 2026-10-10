import { Injectable, inject, DOCUMENT } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { LanguageService } from './language.service';

export interface SeoConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly svcTitle = inject(Title);
  private readonly svcMeta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly svcLanguage = inject(LanguageService);

  readonly strDomain = 'https://royalbakucarrental.com';
  readonly strDefaultImage = `${this.strDomain}/assets/images/logo.png`;
  readonly strSiteName = 'Royal Baku Rent A Car';

  /**
   * Primary SEO update method. Sets page title, description, canonical link,
   * hreflang alternates, OpenGraph/Twitter tags, and JSON-LD structured data.
   */
  fnSetSeo(config: SeoConfig): void {
    const { title, description, image, url, type = 'website', jsonLd } = config;

    // 1. Page Title
    const fullTitle = title.includes('Royal Baku') ? title : `${title} | ${this.strSiteName}`;
    this.svcTitle.setTitle(fullTitle);

    // 2. Meta Description
    this.svcMeta.updateTag({ name: 'description', content: description });

    // 3. URLs and Language Paths
    const rawPath = url || this.router.url || '/';
    const cleanPath = rawPath.split('?')[0].split('#')[0];

    // Compute base English path (without /az prefix)
    let enCleanPath = cleanPath;
    if (enCleanPath === '/az') {
      enCleanPath = '/';
    } else if (enCleanPath.startsWith('/az/')) {
      enCleanPath = enCleanPath.substring(3);
    }
    if (!enCleanPath.startsWith('/')) {
      enCleanPath = '/' + enCleanPath;
    }

    const isAz = this.svcLanguage.strCurrentLang() === 'az';
    const currentPath = isAz ? (enCleanPath === '/' ? '/az' : `/az${enCleanPath}`) : enCleanPath;

    const canonicalUrl = `${this.strDomain}${currentPath}`;
    const enUrl = `${this.strDomain}${enCleanPath}`;
    const azUrl = `${this.strDomain}${enCleanPath === '/' ? '/az' : '/az' + enCleanPath}`;
    const absoluteImage = image
      ? (image.startsWith('http') ? image : `${this.strDomain}${image.startsWith('/') ? image : '/' + image}`)
      : this.strDefaultImage;

    // 4. OpenGraph & Twitter Meta Tags
    this.svcMeta.updateTag({ property: 'og:site_name', content: this.strSiteName });
    this.svcMeta.updateTag({ property: 'og:title', content: fullTitle });
    this.svcMeta.updateTag({ property: 'og:description', content: description });
    this.svcMeta.updateTag({ property: 'og:image', content: absoluteImage });
    this.svcMeta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.svcMeta.updateTag({ property: 'og:type', content: type });
    this.svcMeta.updateTag({ property: 'og:locale', content: isAz ? 'az_AZ' : 'en_US' });

    this.svcMeta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.svcMeta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.svcMeta.updateTag({ name: 'twitter:description', content: description });
    this.svcMeta.updateTag({ name: 'twitter:image', content: absoluteImage });

    // 5. Canonical Link
    this.fnSetLinkTag('canonical', canonicalUrl);

    // 6. Alternate Hreflang Tags
    this.fnSetHreflangTag('en', enUrl);
    this.fnSetHreflangTag('az', azUrl);
    this.fnSetHreflangTag('x-default', enUrl);

    // 7. Structured Data (JSON-LD)
    if (jsonLd) {
      this.fnSetJsonLd(jsonLd);
    } else {
      this.fnRemoveJsonLd();
    }
  }

  /**
   * Helper to insert or update link tags (e.g., canonical).
   */
  private fnSetLinkTag(rel: string, href: string): void {
    let link: HTMLLinkElement | null = this.doc.querySelector(`link[rel="${rel}"]:not([hreflang])`);
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', rel);
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  /**
   * Helper to insert or update hreflang link tags.
   */
  private fnSetHreflangTag(hreflang: string, href: string): void {
    let link: HTMLLinkElement | null = this.doc.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', hreflang);
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  /**
   * Helper to inject or update JSON-LD script block in document head.
   */
  private fnSetJsonLd(jsonLd: Record<string, any> | Array<Record<string, any>>): void {
    let script: HTMLScriptElement | null = this.doc.querySelector('#app-jsonld');
    if (!script) {
      script = this.doc.createElement('script');
      script.id = 'app-jsonld';
      script.setAttribute('type', 'application/ld+json');
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd, null, 2);
  }

  /**
   * Helper to remove existing JSON-LD script block.
   */
  private fnRemoveJsonLd(): void {
    const script = this.doc.querySelector('#app-jsonld');
    if (script) {
      script.remove();
    }
  }
}
