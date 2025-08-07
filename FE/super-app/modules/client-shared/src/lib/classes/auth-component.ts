import { effect, inject } from '@angular/core';
import { AuthService } from '@super-app/auth';

export abstract class AuthComponent {
  private _authService = inject(AuthService);
  constructor() {
    effect(() => {
      this._authService.authorize();
    });
  }
}
