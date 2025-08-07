import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, switchMap } from 'rxjs';

export function appendAuthorizationHeader(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    const authToken = inject(OidcSecurityService).getAccessToken();
    return authToken.pipe(
        switchMap((token: string) => {
            // Kiểm tra nếu có token, thêm nó vào header
            if (token) {
                req = req.clone({
                    setHeaders: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }

            return next(req);
        })
    )
}