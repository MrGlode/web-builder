import { BaseEntity } from '../common';

export interface Theme extends BaseEntity {
  name: string;
  code: string;
  dsTokens: Record<string, unknown>;
  isDefault: boolean;
}

export interface CreateThemePayload {
  name: string;
  code: string;
  dsTokens: Record<string, unknown>;
  isDefault?: boolean;
}