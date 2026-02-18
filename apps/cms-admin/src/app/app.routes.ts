import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },

      // D7 — Dashboard / Admin
      {
        path: 'dashboard',
        loadChildren: () =>
          import('@site-factory/feature-admin').then(m => m.ADMIN_ROUTES),
      },

      // D1 — Site Management
      {
        path: 'sites',
        loadChildren: () =>
          import('@site-factory/feature-site').then(m => m.SITE_ROUTES),
      },

      // D2 — Page Builder
      {
        path: 'page-builder',
        loadChildren: () =>
          import('@site-factory/feature-page-builder').then(m => m.PAGE_BUILDER_ROUTES),
      },

      // D3 — API Connector
      {
        path: 'api-connector',
        loadChildren: () =>
          import('@site-factory/feature-api-connector').then(m => m.API_CONNECTOR_ROUTES),
      },

      // D4 — MFE Registry
      {
        path: 'mfe-registry',
        loadChildren: () =>
          import('@site-factory/feature-mfe-registry').then(m => m.MFE_REGISTRY_ROUTES),
      },

      // D5 — IAM
      {
        path: 'iam',
        loadChildren: () =>
          import('@site-factory/feature-iam').then(m => m.IAM_ROUTES),
      },

      // D6 — Versioning
      {
        path: 'versioning',
        loadChildren: () =>
          import('@site-factory/feature-versioning').then(m => m.VERSIONING_ROUTES),
      },
    ],
  },

  // Fallback
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];