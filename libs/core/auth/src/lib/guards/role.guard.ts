import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard qui vérifie les permissions de l'utilisateur.
 *
 * Usage dans les routes :
 * ```typescript
 * {
 *   path: 'admin',
 *   canActivate: [roleGuard],
 *   data: { permissions: ['config:write'] },
 *   loadComponent: () => ...
 * }
 * ```
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    auth.login();
    return false;
  }

  const requiredPermissions = (route.data['permissions'] as string[]) ?? [];
  const requiredRoles = (route.data['roles'] as string[]) ?? [];

  const hasPermissions =
    requiredPermissions.length === 0 ||
    requiredPermissions.every(p => auth.hasPermission(p));

  const hasRoles =
    requiredRoles.length === 0 ||
    requiredRoles.some(r => auth.hasRole(r));

  if (hasPermissions && hasRoles) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};