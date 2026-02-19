import { Routes } from '@angular/router';

export const SITE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/site-list/site-list.component').then(m => m.SiteListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/site-create/site-create.component').then(m => m.SiteCreateComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/site-detail/site-detail.component').then(m => m.SiteDetailComponent),
  },
];