import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '@site-factory/core-http';
import type {
  ApiResponse,
  ApiPaginatedResponse,
} from '@site-factory/core-http';
import type {
  MicroFrontend,
  CreateMfePayload,
  MfeDeployment,
  CreateMfeDeploymentPayload,
} from '@site-factory/shared-models';
import type { MfeRegistryFilters } from '../models/mfe-registry-filters.model';

@Injectable({ providedIn: 'root' })
export class MfeRegistryApiService {
  private readonly api = inject(ApiClientService);
  private readonly baseUrl = '/api/mfe-registry';

  // ─── MicroFrontend CRUD ─────────────────────────

  getAll(filters?: MfeRegistryFilters): Observable<ApiPaginatedResponse<MicroFrontend>> {
    const params: Record<string, string> = {};

    if (filters?.search) params['search'] = filters.search;
    if (filters?.isActive !== undefined) {
      params['isActive'] = filters.isActive.toString();
    }
    if (filters?.page) params['page'] = filters.page.toString();
    if (filters?.pageSize) params['pageSize'] = filters.pageSize.toString();

    return this.api.get<ApiPaginatedResponse<MicroFrontend>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<ApiResponse<MicroFrontend>> {
    return this.api.get<ApiResponse<MicroFrontend>>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateMfePayload): Observable<ApiResponse<MicroFrontend>> {
    return this.api.post<ApiResponse<MicroFrontend>>(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<CreateMfePayload>): Observable<ApiResponse<MicroFrontend>> {
    return this.api.put<ApiResponse<MicroFrontend>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  // ─── Deployments (sous-ressource) ───────────────

  getDeployments(mfeId: string): Observable<ApiResponse<MfeDeployment[]>> {
    return this.api.get<ApiResponse<MfeDeployment[]>>(
      `${this.baseUrl}/${mfeId}/deployments`
    );
  }

  createDeployment(mfeId: string, payload: CreateMfeDeploymentPayload): Observable<ApiResponse<MfeDeployment>> {
    return this.api.post<ApiResponse<MfeDeployment>>(
      `${this.baseUrl}/${mfeId}/deployments`,
      payload
    );
  }
}