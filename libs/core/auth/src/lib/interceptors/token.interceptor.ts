import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { SF_AUTH_CONFIG } from '../models/auth-config.model';

/**
 * Injecte le Bearer token sur les requêtes vers les API sécurisées.
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const config = inject(SF_AUTH_CONFIG);

  const token = auth.accessToken();

  if (!token) {
    return next(req);
  }

  // Ne pas injecter le token sur des URLs non sécurisées
  const isSecuredUrl = config.securedApiUrls.some(url => req.url.startsWith(url));

  if (!isSecuredUrl) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(cloned);
};