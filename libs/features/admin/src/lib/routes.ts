import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
  },
  {
    path: 'themes',
    loadComponent: () =>
      import('./pages/theme-list.component').then((m) => m.ThemeListComponent),
  },
  {
    path: 'translations',
    loadComponent: () =>
      import('./pages/translation-list.component').then((m) => m.TranslationListComponent),
  },
  {
    path: 'config',
    loadComponent: () =>
      import('./pages/config-list.component').then((m) => m.ConfigListComponent),
  },
];