import { BaseEntity } from '../common';

export interface LayoutZone {
  key: string;
  label: string;
}

export interface Layout extends BaseEntity {
  name: string;
  description?: string | null;
  zones: LayoutZone[];
  isSystem: boolean;
}

export interface CreateLayoutPayload {
  name: string;
  description?: string;
  zones: LayoutZone[];
}