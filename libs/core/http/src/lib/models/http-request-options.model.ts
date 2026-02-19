import { HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';

export interface HttpRequestOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams | Record<string, string | string[]>;
  context?: HttpContext;
  withCredentials?: boolean;
  reportProgress?: boolean;
  skipLoading?: boolean;
  skipErrorHandling?: boolean;
}