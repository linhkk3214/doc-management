import { Injectable } from '@angular/core';
import { LoginResponse, OidcSecurityService } from 'angular-auth-oidc-client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private _oidcSecurityService: OidcSecurityService
  ) { }

  checkAuth() {
    return this._oidcSecurityService.checkAuth();
  }

  authorize() {
    this._oidcSecurityService
      .checkAuth()
      .subscribe((loginResponse: LoginResponse) => {
        const { isAuthenticated, userData, accessToken, idToken, configId } = loginResponse;
        if (!isAuthenticated) {
          console.log('not-authenticated');
          this._oidcSecurityService.authorize();
        }
        else {
          console.log('authenticated');
        }
      });
  }

  logout() {
    this._oidcSecurityService
      .logoff()
      .subscribe((result) => console.log(result));
  }
}
