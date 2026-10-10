import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AboutPageData } from '../models/about.model';

@Injectable({
  providedIn: 'root',
})
export class AboutService {
  private readonly http = inject(HttpClient);
  private readonly strApiBaseUrl = `${environment.apiBaseUrl}/about`;

  /**
   * Fetches About Page JSON configuration directly from DRF backend API.
   * Returns Observable<AboutPageData>.
   */
  public getAboutData(): Observable<AboutPageData> {
    return this.http.get<AboutPageData>(`${this.strApiBaseUrl}/current/`);
  }
}
