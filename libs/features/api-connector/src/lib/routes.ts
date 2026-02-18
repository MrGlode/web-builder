import { Routes } from '@angular/router';

export const API_CONNECTOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/api-connector-shell.component').then(m => m.ApiConnectorShellComponent),
  },
];