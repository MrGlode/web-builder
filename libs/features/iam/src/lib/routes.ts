import { Routes } from '@angular/router';

export const IAM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/user-list.component').then((m) => m.UserListComponent),
  },
  {
    path: 'audit',
    loadComponent: () =>
      import('./pages/audit-log.component').then((m) => m.AuditLogComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/user-detail.component').then((m) => m.UserDetailComponent),
  },
];