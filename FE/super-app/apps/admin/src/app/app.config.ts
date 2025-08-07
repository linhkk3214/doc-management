import { APP_INITIALIZER, ApplicationConfig, inject, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';

import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { InMemoryCache } from '@apollo/client/core';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import Aura from '@primeng/themes/aura';
import { appendAuthorizationHeader, AuthService, AuthStorageService } from '@super-app/auth';
import { AbstractSecurityStorage, LogLevel, provideAuth } from 'angular-auth-oidc-client';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { providePrimeNG } from 'primeng/config';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { BluePreset } from '@super-app/shared';
import { MessageService } from 'primeng/api';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(
      withInterceptors([appendAuthorizationHeader])
    ),
    provideRouter(routes, withEnabledBlockingInitialNavigation()),
    provideApollo(() => {
      const httpLink = inject(HttpLink);

      return {
        link: httpLink.create({ uri: 'https://ocr-app-api.csharpp.com/graphql' }),
        cache: new InMemoryCache(),
      };
    }),
    provideAuth({
      config: {
        authority: 'https://localhost:6996',
        redirectUrl: window.location.origin,
        postLogoutRedirectUri: window.location.origin + '/public',
        clientId: 'angular-client',
        scope: 'openid offline_access',
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true,
        logLevel: LogLevel.Debug,
      }
    }),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: BluePreset,
        options: {
          darkModeSelector: '.my-app-dark',
          cssLayer: {
            name: 'primeng',
            order: 'tailwind-base, primeng, tailwind-utilities'
          }
        }
      },
    }),
    MessageService,
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    { provide: AbstractSecurityStorage, useClass: AuthStorageService },
    {
      provide: LOCALE_ID, useValue: 'vi-VN'
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const oidcService = inject(AuthService);
        return () => firstValueFrom(oidcService.checkAuth());
      }
    }
  ]
};
