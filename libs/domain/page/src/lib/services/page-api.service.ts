import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '@site-factory/core-http';
import type {
  ApiResponse,
  ApiPaginatedResponse,
} from '@site-factory/core-http';
import type {
  Page,
  CreatePagePayload,
  UpdatePagePayload,
} from '@site-factory/shared-models';
import type { PageFilters } from '../models/page-filters.model';

@Injectable({ providedIn: 'root' })
export class PageApiService {
  private readonly api = inject(ApiClientService);

  /**
   * URL nestée : les pages sont toujours sous un site.
   */
  private baseUrl(siteId: string): string {
    return `/api/sites/${siteId}/pages`;
  }

  getAll(filters: PageFilters): Observable<ApiPaginatedResponse<Page>> {
    const params: Record<string, string> = {};

    if (filters.search) params['search'] = filters.search;
    if (filters.parentId !== undefined) {
      params['parentId'] = filters.parentId ?? '';
    }
    if (filters.status) params['status'] = filters.status;
    if (filters.page) params['page'] = filters.page.toString();
    if (filters.pageSize) params['pageSize'] = filters.pageSize.toString();

    return this.api.get<ApiPaginatedResponse<Page>>(
      this.baseUrl(filters.siteId),
      { params }
    );
  }

  getById(siteId: string, pageId: string): Observable<ApiResponse<Page>> {
    return this.api.get<ApiResponse<Page>>(
      `${this.baseUrl(siteId)}/${pageId}`
    );
  }

  create(siteId: string, payload: CreatePagePayload): Observable<ApiResponse<Page>> {
    return this.api.post<ApiResponse<Page>>(
      this.baseUrl(siteId),
      payload
    );
  }

  update(siteId: string, pageId: string, payload: UpdatePagePayload): Observable<ApiResponse<Page>> {
    return this.api.put<ApiResponse<Page>>(
      `${this.baseUrl(siteId)}/${pageId}`,
      payload
    );
  }

  delete(siteId: string, pageId: string): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(
      `${this.baseUrl(siteId)}/${pageId}`
    );
  }
}