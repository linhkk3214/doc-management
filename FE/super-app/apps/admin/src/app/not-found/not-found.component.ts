import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'not-found',
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.component.scss'],
  imports: [CommonModule],
  standalone: true
})
export class NotFoundComponent {
}
