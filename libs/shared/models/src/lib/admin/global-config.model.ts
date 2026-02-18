export interface GlobalConfig {
  id: string;
  key: string;
  value: unknown;
  description?: string | null;
  updatedBy: string;
  updatedAt: Date;
}

export interface UpdateGlobalConfigPayload {
  value: unknown;
}