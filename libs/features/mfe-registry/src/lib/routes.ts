import { Routes } from '@angular/router';

export const MFE_REGISTRY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/mfe-list.component').then((m) => m.MfeListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/mfe-create.component').then((m) => m.MfeCreateComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/mfe-detail.component').then((m) => m.MfeDetailComponent),
  },
];