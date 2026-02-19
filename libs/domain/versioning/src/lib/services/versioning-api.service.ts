import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '@site-factory/core-http';
import type {
  ApiResponse,
  ApiPaginatedResponse,
} from '@site-factory/core-http';
import type {
  EntityVersion,
  WorkflowTransition,
  CreateVersionPayload,
  TransitionPayload,
} from '@site-factory/shared-models';
import type { VersioningFilters } from '../models/versioning-filters.model';

@Injectable({ providedIn: 'root' })
export class VersioningApiService {
  private readonly api = inject(ApiClientService);
  private readonly baseUrl = '/api/versions';

  // ─── Versions ───────────────────────────────────

  /** Lister les versions d'une entité */
  getAll(filters: VersioningFilters): Observable<ApiPaginatedResponse<EntityVersion>> {
    const params: Record<string, string> = {
      entityType: filters.entityType,
      entityId: filters.entityId,
    };

    if (filters.status) params['status'] = filters.status;
    if (filters.page) params['page'] = filters.page.toString();
    if (filters.pageSize) params['pageSize'] = filters.pageSize.toString();

    return this.api.get<ApiPaginatedResponse<EntityVersion>>(this.baseUrl, { params });
  }

  /** Récupérer une version par ID */
  getById(versionId: string): Observable<ApiResponse<EntityVersion>> {
    return this.api.get<ApiResponse<EntityVersion>>(`${this.baseUrl}/${versionId}`);
  }

  /** Créer une nouvelle version (snapshot) */
  create(payload: CreateVersionPayload): Observable<ApiResponse<EntityVersion>> {
    return this.api.post<ApiResponse<EntityVersion>>(this.baseUrl, payload);
  }

  // ─── Workflow Transitions ───────────────────────

  /** Récupérer les transitions d'une version */
  getTransitions(versionId: string): Observable<ApiResponse<WorkflowTransition[]>> {
    return this.api.get<ApiResponse<WorkflowTransition[]>>(
      `${this.baseUrl}/${versionId}/transitions`
    );
  }

  /** Effectuer une transition de statut */
  transition(versionId: string, payload: TransitionPayload): Observable<ApiResponse<EntityVersion>> {
    return this.api.post<ApiResponse<EntityVersion>>(
      `${this.baseUrl}/${versionId}/transitions`,
      payload
    );
  }
}