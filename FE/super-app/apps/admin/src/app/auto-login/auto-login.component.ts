import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'auto-login',
  templateUrl: './auto-login.html',
  styleUrls: ['./auto-login.component.scss'],
  imports: [CommonModule],
  standalone: true
})
export class AutoLoginComponent {
  load: boolean = true;
  constructor(private _oidcSecurityService: OidcSecurityService) {

  }

  ngOnInit() {
    
  }

  login() {
    this._oidcSecurityService.authorize();
  }

  logout() {
    this._oidcSecurityService
      .logoff()
      .subscribe((result) => console.log(result));
  }
}
