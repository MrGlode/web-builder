import { Routes } from '@angular/router';

export const PAGE_BUILDER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/page-builder-shell.component').then(m => m.PageBuilderShellComponent),
  },
];