import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BlogPost } from '../../models/blog-post.model';
import { LangUrlPipe } from '../../pipes/lang-url.pipe';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LangUrlPipe],
  templateUrl: './blog-card.html',
  styleUrl: './blog-card.css',
})
export class BlogCard {
  @Input({ required: true }) objPost!: BlogPost;

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
