export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  siteId?: string | null;
  payload?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: Date;
}