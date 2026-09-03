import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Nav } from './shared/components/nav/nav';
import { Footer } from './shared/components/footer/footer';
import { FloatingContactButtons } from './shared/components/floating-contact-buttons/floating-contact-buttons';

@Component({
  imports: [RouterOutlet, Nav, Footer, FloatingContactButtons],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Royalbaku Frontend');
}
