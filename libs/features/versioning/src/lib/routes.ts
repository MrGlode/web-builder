import { Routes } from '@angular/router';

export const VERSIONING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/version-list.component').then((m) => m.VersionListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/version-detail.component').then((m) => m.VersionDetailComponent),
  },
];