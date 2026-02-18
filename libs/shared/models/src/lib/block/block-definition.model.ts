import { BaseEntity, BlockSourceType } from '../common';

export interface BlockDefinition extends BaseEntity {
  name: string;
  code: string;
  description?: string | null;
  category: string;
  sourceType: BlockSourceType;
  mfeId?: string | null;
  propsSchema: Record<string, unknown>;
  defaultProps?: Record<string, unknown> | null;
  thumbnailUrl?: string | null;
  isActive: boolean;
}