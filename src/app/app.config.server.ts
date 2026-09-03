import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

export class TranslateServerLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    try {
      const filePath = path.join(process.cwd(), 'src/assets/i18n', `${lang}.json`);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return of(data);
      }
    } catch (e) {
      console.error(`Error reading i18n file for ${lang}:`, e);
    }
    return of({});
  }
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: TranslateLoader,
      useClass: TranslateServerLoader,
    },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
