import { Injectable } from '@angular/core';
import { Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { StorageService } from '@super-app/shared';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthorizationGuard {
  constructor(
    private _oidcSecurityService: OidcSecurityService,
    private _router: Router,
    private _storageService: StorageService
  ) { }

  canMatch(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> {
    const hasAuthCode = window.location.search.includes('code=') && window.location.search.includes('state=');
    // Nếu URL đang chứa code trả về từ IdentityServer4 => cho qua
    if (hasAuthCode) {
      return of(true);
    }
    const path = '/' + segments.map(s => s.path).join('/');

    return this._oidcSecurityService.isAuthenticated$.pipe(
      take(1),
      map(({ isAuthenticated }) => {
        if (isAuthenticated) {
          return true;
        }
        this._storageService.write('redirect-url', path);
        this._oidcSecurityService.authorize();
        return false;
      })
    );

    // const path = route.routeConfig?.path;
    // return this._oidcSecurityService.isAuthenticated$.pipe(
    //   take(1),
    //   map(({ isAuthenticated }) => {
    //     // allow navigation if authenticated
    //     if (isAuthenticated) {
    //       return true;
    //     }
    //     this._storageService.write('redirect-url', path);
    //     this._router.navigate(['login']);
    //     // redirect if not authenticated
    //     return this._router.parseUrl('');
    //   })
    // );
  }
}
