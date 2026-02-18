import { Routes } from '@angular/router';

export const VERSIONING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/versioning-shell.component').then(m => m.VersioningShellComponent),
  },
];