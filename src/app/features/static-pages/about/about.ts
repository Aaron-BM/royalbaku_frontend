import { Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  protected readonly strActiveTab = signal<'mission' | 'vision' | 'fleet'>('mission');

  protected fnSelectTab(strTab: 'mission' | 'vision' | 'fleet'): void {
    this.strActiveTab.set(strTab);
  }
}
