import { mapToCanMatch, Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { PortfolioComponent } from '../components/portfolio/portfolio.component';
import { DocumentComponent } from '../components/document/document.component';

export const routes: Routes = [
  {
    path: 'public',
    loadComponent: () => import('./public/public.component').then(m => m.PublicComponent),
  },
  {
    path: '',
    //canMatch: mapToCanMatch([AuthorizationGuard]),
    children: [
      {
        path: 'van-ban',
        component: DocumentComponent
      },
      {
        path: 'ho-so',
        component: PortfolioComponent
      },
    ]
  },
  { path: '**', component: NotFoundComponent },
];
