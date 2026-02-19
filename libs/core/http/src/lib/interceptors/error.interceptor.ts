import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ApiHttpError } from '../models/api-error.model';

/** Permet de désactiver la gestion d'erreur globale pour une requête spécifique */
export const SKIP_ERROR_HANDLING = new HttpContextToken<boolean>(() => false);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_ERROR_HANDLING)) {
    return next(req);
  }

  return next(req).pipe(
    catchError(error => {
      const apiError = parseError(error);

      // Log structuré — sera remplacé par core/logger plus tard
      console.error(`[HTTP ${apiError.status}] ${apiError.code}: ${apiError.message}`, {
        path: apiError.path ?? req.url,
        details: apiError.details,
      });

      return throwError(() => apiError);
    })
  );
};

function parseError(error: unknown): ApiHttpError {
  if (isHttpErrorResponse(error)) {
    const body = error.error as Record<string, unknown> | null;

    if (body && typeof body === 'object' && 'code' in body && 'message' in body) {
      return new ApiHttpError(
        error.status,
        body['code'] as string,
        body['message'] as string,
        body['details'] as Record<string, unknown> | undefined,
        (body['timestamp'] as string) ?? new Date().toISOString(),
        error.url ?? undefined
      );
    }

    return new ApiHttpError(
      error.status,
      `HTTP_${error.status}`,
      error.statusText || 'An unexpected error occurred',
      undefined,
      new Date().toISOString(),
      error.url ?? undefined
    );
  }

  return new ApiHttpError(
    0,
    'NETWORK_ERROR',
    'Unable to connect to the server',
    undefined,
    new Date().toISOString()
  );
}

function isHttpErrorResponse(
  error: unknown
): error is { status: number; statusText: string; url: string | null; error: unknown } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'statusText' in error
  );
}