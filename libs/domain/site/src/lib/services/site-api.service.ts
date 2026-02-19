import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '@site-factory/core-http';
import type {
  ApiResponse,
  ApiPaginatedResponse,
} from '@site-factory/core-http';
import type {
  Site,
  CreateSitePayload,
  UpdateSitePayload,
} from '@site-factory/shared-models';
import { SiteFilters } from '../models/site-filters.model';

@Injectable({ providedIn: 'root' })
export class SiteApiService {
  private readonly api = inject(ApiClientService);
  private readonly baseUrl = '/api/sites';

  getAll(filters?: SiteFilters): Observable<ApiPaginatedResponse<Site>> {
    const params: Record<string, string> = {};

    if (filters?.search) params['search'] = filters.search;
    if (filters?.tenantId) params['tenantId'] = filters.tenantId;
    if (filters?.status) params['status'] = filters.status;
    if (filters?.page) params['page'] = filters.page.toString();
    if (filters?.pageSize) params['pageSize'] = filters.pageSize.toString();

    return this.api.get<ApiPaginatedResponse<Site>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<ApiResponse<Site>> {
    return this.api.get<ApiResponse<Site>>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateSitePayload): Observable<ApiResponse<Site>> {
    return this.api.post<ApiResponse<Site>>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateSitePayload): Observable<ApiResponse<Site>> {
    return this.api.put<ApiResponse<Site>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}