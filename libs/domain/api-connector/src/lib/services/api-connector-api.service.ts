import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '@site-factory/core-http';
import type {
  ApiResponse,
  ApiPaginatedResponse,
} from '@site-factory/core-http';
import type { ApiReference } from '@site-factory/shared-models';
import type { ApiConnectorFilters } from '../models/api-connector-filters.model';

/**
 * Service API pour le catalogue d'API WSO2 APIM.
 *
 * IMPORTANT : Ce service est READ-ONLY + SYNC.
 * Le CMS ne crée pas d'API — il synchronise le cache local
 * depuis WSO2 APIM Developer Portal.
 */
@Injectable({ providedIn: 'root' })
export class ApiConnectorApiService {
  private readonly api = inject(ApiClientService);
  private readonly baseUrl = '/api/api-references';

  /** Lister les références API en cache */
  getAll(filters?: ApiConnectorFilters): Observable<ApiPaginatedResponse<ApiReference>> {
    const params: Record<string, string> = {};

    if (filters?.search) params['search'] = filters.search;
    if (filters?.isAvailable !== undefined) {
      params['isAvailable'] = filters.isAvailable.toString();
    }
    if (filters?.tags?.length) params['tags'] = filters.tags.join(',');
    if (filters?.page) params['page'] = filters.page.toString();
    if (filters?.pageSize) params['pageSize'] = filters.pageSize.toString();

    return this.api.get<ApiPaginatedResponse<ApiReference>>(this.baseUrl, { params });
  }

  /** Récupérer une référence API par ID */
  getById(id: string): Observable<ApiResponse<ApiReference>> {
    return this.api.get<ApiResponse<ApiReference>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Déclencher une synchronisation depuis WSO2 APIM.
   * Le backend va interroger le Developer Portal et mettre à jour le cache local.
   */
  syncFromWso2(): Observable<ApiResponse<{ synced: number; errors: number }>> {
    return this.api.post<ApiResponse<{ synced: number; errors: number }>>(
      `${this.baseUrl}/sync`,
      {}
    );
  }
}