import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '@site-factory/core-http';
import type {
  ApiResponse,
  ApiPaginatedResponse,
} from '@site-factory/core-http';
import type {
  UserProfile,
  Role,
  UserSiteRole,
} from '@site-factory/shared-models';
import type { IamFilters } from '../models/iam-filters.model';

@Injectable({ providedIn: 'root' })
export class IamApiService {
  private readonly api = inject(ApiClientService);

  // ─── Users ──────────────────────────────────────

  getUsers(filters?: IamFilters): Observable<ApiPaginatedResponse<UserProfile>> {
    const params: Record<string, string> = {};

    if (filters?.search) params['search'] = filters.search;
    if (filters?.roleId) params['roleId'] = filters.roleId;
    if (filters?.siteId) params['siteId'] = filters.siteId;
    if (filters?.isActive !== undefined) {
      params['isActive'] = filters.isActive.toString();
    }
    if (filters?.page) params['page'] = filters.page.toString();
    if (filters?.pageSize) params['pageSize'] = filters.pageSize.toString();

    return this.api.get<ApiPaginatedResponse<UserProfile>>('/api/users', { params });
  }

  getUserById(id: string): Observable<ApiResponse<UserProfile>> {
    return this.api.get<ApiResponse<UserProfile>>(`/api/users/${id}`);
  }

  // ─── Roles ──────────────────────────────────────

  getRoles(): Observable<ApiResponse<Role[]>> {
    return this.api.get<ApiResponse<Role[]>>('/api/roles');
  }

  // ─── Role Assignments ───────────────────────────

  getUserSiteRoles(userId: string): Observable<ApiResponse<UserSiteRole[]>> {
    return this.api.get<ApiResponse<UserSiteRole[]>>(
      `/api/users/${userId}/roles`
    );
  }

  assignRole(userId: string, roleId: string, siteId?: string): Observable<ApiResponse<UserSiteRole>> {
    return this.api.post<ApiResponse<UserSiteRole>>(
      `/api/users/${userId}/roles`,
      { roleId, siteId: siteId ?? null }
    );
  }

  revokeRole(userId: string, assignmentId: string): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(
      `/api/users/${userId}/roles/${assignmentId}`
    );
  }
}