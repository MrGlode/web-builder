import { BaseEntity } from '../common';

export interface ApiBindingMapping {
  [blocProp: string]: string;
}

export interface ApiBinding {
  apiRefId: string;
  operationId: string;
  requestMapping?: ApiBindingMapping;
  responseMapping?: ApiBindingMapping;
}

export interface BlockInstance extends BaseEntity {
  pageId: string;
  blockDefId: string;
  zoneKey: string;
  position: number;
  props: Record<string, unknown>;
  apiBinding?: ApiBinding | null;
  visibility?: Record<string, unknown> | null;
}

export interface CreateBlockInstancePayload {
  pageId: string;
  blockDefId: string;
  zoneKey: string;
  position?: number;
  props: Record<string, unknown>;
  apiBinding?: ApiBinding;
}

export interface UpdateBlockInstancePayload {
  zoneKey?: string;
  position?: number;
  props?: Record<string, unknown>;
  apiBinding?: ApiBinding | null;
}