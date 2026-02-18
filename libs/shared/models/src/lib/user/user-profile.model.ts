import { BaseEntity } from '../common';

export interface UserProfile extends BaseEntity {
  wso2Sub: string;
  email: string;
  displayName: string;
  lastLoginAt?: Date | null;
  isActive: boolean;
}