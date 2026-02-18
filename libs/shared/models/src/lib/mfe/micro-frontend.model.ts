import { BaseEntity } from '../common';

export interface MicroFrontend extends BaseEntity {
  name: string;
  code: string;
  description?: string | null;
  remoteName: string;
  exposedModule: string;
  currentVersion: string;
  isActive: boolean;
}

export interface CreateMfePayload {
  name: string;
  code: string;
  description?: string;
  remoteName: string;
  exposedModule: string;
  currentVersion: string;
}