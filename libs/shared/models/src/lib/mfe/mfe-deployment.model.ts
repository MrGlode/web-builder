import { MfeEnvironment } from '../common';

export interface MfeDeployment {
  id: string;
  mfeId: string;
  version: string;
  remoteUrl: string;
  environment: MfeEnvironment;
  integrityHash?: string | null;
  deployedAt: Date;
  deployedBy: string;
  isActive: boolean;
}

export interface CreateMfeDeploymentPayload {
  mfeId: string;
  version: string;
  remoteUrl: string;
  environment: MfeEnvironment;
  integrityHash?: string;
}