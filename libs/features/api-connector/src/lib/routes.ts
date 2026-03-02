import { Routes } from '@angular/router';

export const API_CONNECTOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/api-connector-list.component').then((m) => m.ApiConnectorListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/api-connector-detail.component').then((m) => m.ApiConnectorDetailComponent),
  },
];