import { Routes } from '@angular/router';

export const PAGE_BUILDER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/page-list.component').then((m) => m.PageListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/page-create.component').then((m) => m.PageCreateComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/page-detail.component').then((m) => m.PageDetailComponent),
  },
];