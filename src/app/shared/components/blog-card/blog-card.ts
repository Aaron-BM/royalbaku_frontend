import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BlogPost } from '../../models/blog-post.model';
import { LangUrlPipe } from '../../pipes/lang-url.pipe';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LangUrlPipe],
  templateUrl: './blog-card.html',
  styleUrl: './blog-card.css',
})
export class BlogCard {
  private readonly svcLanguage = inject(LanguageService);

  @Input({ required: true }) objPost!: BlogPost;
  @Input() numIndex = 0;

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
}
