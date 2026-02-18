import { BaseEntity, MfeEnvironment } from '../common';

export interface ApiReference extends BaseEntity {
  wso2ApiId: string;
  name: string;
  version: string;
  contextPath: string;
  description?: string | null;
  tags?: string[];
  oasSchema?: Record<string, unknown> | null;
  environments: Record<MfeEnvironment, string>;
  lastSyncedAt: Date;
  isAvailable: boolean;
}