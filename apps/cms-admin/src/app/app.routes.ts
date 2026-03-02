import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'sites',
        loadChildren: () =>
          import('@site-factory/feature-site').then((m) => m.SITE_ROUTES),
      },
      {
        path: 'pages',
        loadChildren: () =>
          import('@site-factory/feature-page-builder').then((m) => m.PAGE_BUILDER_ROUTES),
      },
      {
        path: 'api-connectors',
        loadChildren: () =>
          import('@site-factory/feature-api-connector').then((m) => m.API_CONNECTOR_ROUTES),
      },
      {
        path: 'mfe-registry',
        loadChildren: () =>
          import('@site-factory/feature-mfe-registry').then((m) => m.MFE_REGISTRY_ROUTES),
      },
      {
        path: 'iam',
        loadChildren: () =>
          import('@site-factory/feature-iam').then((m) => m.IAM_ROUTES),
      },
      {
        path: 'versioning',
        loadChildren: () =>
          import('@site-factory/feature-versioning').then((m) => m.VERSIONING_ROUTES),
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('@site-factory/feature-admin').then((m) => m.ADMIN_ROUTES),
      },
      { path: '', redirectTo: 'sites', pathMatch: 'full' },
    ],
  },
];