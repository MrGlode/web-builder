import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpRequestOptions } from '../models/http-request-options.model';
import { SKIP_LOADING } from '../interceptors/loading.interceptor';
import { SKIP_ERROR_HANDLING } from '../interceptors/error.interceptor';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);

  get<T>(url: string, options?: HttpRequestOptions): Observable<T> {
    return this.http.get<T>(url, this.buildOptions(options));
  }

  post<T>(url: string, body: unknown, options?: HttpRequestOptions): Observable<T> {
    return this.http.post<T>(url, body, this.buildOptions(options));
  }

  put<T>(url: string, body: unknown, options?: HttpRequestOptions): Observable<T> {
    return this.http.put<T>(url, body, this.buildOptions(options));
  }

  patch<T>(url: string, body: unknown, options?: HttpRequestOptions): Observable<T> {
    return this.http.patch<T>(url, body, this.buildOptions(options));
  }

  delete<T>(url: string, options?: HttpRequestOptions): Observable<T> {
    return this.http.delete<T>(url, this.buildOptions(options));
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