import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '@site-factory/core-http';
import type { ApiResponse } from '@site-factory/core-http';
import type {
  Theme,
  CreateThemePayload,
  Translation,
  UpsertTranslationPayload,
  GlobalConfig,
  UpdateGlobalConfigPayload,
} from '@site-factory/shared-models';
import type { TranslationFilters, ThemeFilters } from '../models/admin-filters.model';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly api = inject(ApiClientService);

  // ─── Themes ─────────────────────────────────────

  getThemes(filters?: ThemeFilters): Observable<ApiResponse<Theme[]>> {
    const params: Record<string, string> = {};
    if (filters?.search) params['search'] = filters.search;

    return this.api.get<ApiResponse<Theme[]>>('/api/themes', { params });
  }

  getThemeById(id: string): Observable<ApiResponse<Theme>> {
    return this.api.get<ApiResponse<Theme>>(`/api/themes/${id}`);
  }

  createTheme(payload: CreateThemePayload): Observable<ApiResponse<Theme>> {
    return this.api.post<ApiResponse<Theme>>('/api/themes', payload);
  }

  updateTheme(id: string, payload: Partial<CreateThemePayload>): Observable<ApiResponse<Theme>> {
    return this.api.put<ApiResponse<Theme>>(`/api/themes/${id}`, payload);
  }

  deleteTheme(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`/api/themes/${id}`);
  }

  // ─── Translations ───────────────────────────────

  getTranslations(filters?: TranslationFilters): Observable<ApiResponse<Translation[]>> {
    const params: Record<string, string> = {};
    if (filters?.locale) params['locale'] = filters.locale;
    if (filters?.namespace) params['namespace'] = filters.namespace;
    if (filters?.search) params['search'] = filters.search;

    return this.api.get<ApiResponse<Translation[]>>('/api/translations', { params });
  }

  upsertTranslation(payload: UpsertTranslationPayload): Observable<ApiResponse<Translation>> {
    return this.api.post<ApiResponse<Translation>>('/api/translations', payload);
  }

  deleteTranslation(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`/api/translations/${id}`);
  }

  // ─── Global Config ──────────────────────────────

  getGlobalConfigs(): Observable<ApiResponse<GlobalConfig[]>> {
    return this.api.get<ApiResponse<GlobalConfig[]>>('/api/global-config');
  }

  updateGlobalConfig(key: string, payload: UpdateGlobalConfigPayload): Observable<ApiResponse<GlobalConfig>> {
    return this.api.put<ApiResponse<GlobalConfig>>(`/api/global-config/${key}`, payload);
  }
}