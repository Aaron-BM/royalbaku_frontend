import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Nav } from './layout/nav/nav';
import { Footer } from './layout/footer/footer';
import { FloatingContactButtons } from './layout/floating-contact-buttons/floating-contact-buttons';

@Component({
  imports: [RouterOutlet, Nav, Footer, FloatingContactButtons],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Royalbaku Frontend');
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.router.events
      .pipe(
        filter((objEvent): objEvent is NavigationEnd => objEvent instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
          document.body.scrollTop = 0;
          document.documentElement.scrollTop = 0;
        }
      });
  }
}
