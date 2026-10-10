import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LangUrlPipe } from '../../../shared/pipes/lang-url.pipe';
import { SeoService } from '../../../core/services/seo.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LangUrlPipe],
  templateUrl: './not-found.html',
})
export class NotFound implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });
  private readonly svcSog = inject(SeoService);
  readonly svcLanguage = inject(LanguageService);

  ngOnInit(): void {
    // Set 404 status code during SSR execution
    if (isPlatformServer(this.platformId) && this.responseInit) {
      this.responseInit.status = 404;
    }

    // Set localized SEO metadata for 404 page
    const isAz = this.svcLanguage.strCurrentLang() === 'az';
    this.svcSog.fnSetSeo({
      title: isAz ? '404 - Səhifə Tapılmadı' : '404 - Page Not Found',
      description: isAz
        ? 'Axtardığınız səhifə mövcud deyil və ya yeri dəyişdirilmişdir.'
        : 'The page you are looking for does not exist or has been moved.',
    });
  }
}
