import { Routes } from '@angular/router';

export const IAM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/iam-shell.component').then(m => m.IamShellComponent),
  },
];