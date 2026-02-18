import { Routes } from '@angular/router';

export const MFE_REGISTRY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/mfe-registry-shell.component').then(m => m.MfeRegistryShellComponent),
  },
];