import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '@site-factory/core-http';
import type { ApiPaginatedResponse } from '@site-factory/core-http';
import type { AuditLog } from '@site-factory/shared-models';
import type { AuditFilters } from '../models/audit-filters.model';

/**
 * Service API pour les logs d'audit.
 * READ-ONLY : les audit logs sont créés côté backend uniquement.
 */
@Injectable({ providedIn: 'root' })
export class AuditApiService {
  private readonly api = inject(ApiClientService);
  private readonly baseUrl = '/api/audit-logs';

  getAll(filters?: AuditFilters): Observable<ApiPaginatedResponse<AuditLog>> {
    const params: Record<string, string> = {};

    if (filters?.entityType) params['entityType'] = filters.entityType;
    if (filters?.entityId) params['entityId'] = filters.entityId;
    if (filters?.userId) params['userId'] = filters.userId;
    if (filters?.siteId) params['siteId'] = filters.siteId;
    if (filters?.action) params['action'] = filters.action;
    if (filters?.dateFrom) params['dateFrom'] = filters.dateFrom;
    if (filters?.dateTo) params['dateTo'] = filters.dateTo;
    if (filters?.page) params['page'] = filters.page.toString();
    if (filters?.pageSize) params['pageSize'] = filters.pageSize.toString();

    return this.api.get<ApiPaginatedResponse<AuditLog>>(this.baseUrl, { params });
  }
}