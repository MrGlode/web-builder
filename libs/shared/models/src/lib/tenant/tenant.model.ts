import { BaseEntity } from '../common';

export interface Tenant extends BaseEntity {
  name: string;
  code: string;
  description?: string | null;
  config?: Record<string, unknown> | null;
  isActive: boolean;
}

export interface CreateTenantPayload {
  name: string;
  code: string;
  description?: string;
  config?: Record<string, unknown>;
}

export interface UpdateTenantPayload {
  name?: string;
  description?: string;
  config?: Record<string, unknown>;
  isActive?: boolean;
}