import { Routes } from '@angular/router';

export const SITE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/site-shell.component').then(m => m.SiteShellComponent),
  },
];