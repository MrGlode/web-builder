import { VersionStatus } from '../common';

export interface EntityVersion {
  id: string;
  entityType: string;
  entityId: string;
  versionNumber: number;
  status: VersionStatus;
  snapshot: Record<string, unknown>;
  changeSummary?: string | null;
  createdBy: string;
  createdAt: Date;
}

export interface WorkflowTransition {
  id: string;
  versionId: string;
  fromStatus: VersionStatus;
  toStatus: VersionStatus;
  transitionedBy: string;
  comment?: string | null;
  createdAt: Date;
}

export interface CreateVersionPayload {
  entityType: string;
  entityId: string;
  snapshot: Record<string, unknown>;
  changeSummary?: string;
}

export interface TransitionPayload {
  toStatus: VersionStatus;
  comment?: string;
}