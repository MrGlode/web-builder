import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpRequestOptions } from '../models/http-request-options.model';
import { SKIP_LOADING } from '../interceptors/loading.interceptor';
import { SKIP_ERROR_HANDLING } from '../interceptors/error.interceptor';
import { APP_CONFIG } from '@site-factory/core-config';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  get<T>(url: string, options?: HttpRequestOptions): Observable<T> {
    return this.http.get<T>(this.resolveUrl(url), this.buildOptions(options));
  }

  post<T>(url: string, body: unknown, options?: HttpRequestOptions): Observable<T> {
    return this.http.post<T>(this.resolveUrl(url), body, this.buildOptions(options));
  }

  put<T>(url: string, body: unknown, options?: HttpRequestOptions): Observable<T> {
    return this.http.put<T>(this.resolveUrl(url), body, this.buildOptions(options));
  }

  patch<T>(url: string, body: unknown, options?: HttpRequestOptions): Observable<T> {
    return this.http.patch<T>(this.resolveUrl(url), body, this.buildOptions(options));
  }

  delete<T>(url: string, options?: HttpRequestOptions): Observable<T> {
    return this.http.delete<T>(this.resolveUrl(url), this.buildOptions(options));
  }

  /**
   * Resout l'URL complete.
   * Si l'URL est absolue (http/https), on la laisse telle quelle.
   * Sinon, on prefixe avec apiBaseUrl.
   */
  private resolveUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return ``;
  }

  private buildOptions(options?: HttpRequestOptions): {
    headers?: HttpHeaders;
    params?: HttpParams;
    context?: HttpContext;
    withCredentials?: boolean;
    reportProgress?: boolean;
  } {
    if (!options) return {};

    let context = options.context ?? new HttpContext();

    if (options.skipLoading) {
      context = context.set(SKIP_LOADING, true);
    }

    if (options.skipErrorHandling) {
      context = context.set(SKIP_ERROR_HANDLING, true);
    }

    const headers =
      options.headers instanceof HttpHeaders
        ? options.headers
        : options.headers
          ? new HttpHeaders(options.headers as Record<string, string>)
          : undefined;

    const params =
      options.params instanceof HttpParams
        ? options.params
        : options.params
          ? new HttpParams({ fromObject: options.params as Record<string, string> })
          : undefined;

    return {
      headers,
      params,
      context,
      withCredentials: options.withCredentials,
      reportProgress: options.reportProgress,
    };
  }
}
