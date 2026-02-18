import { BaseEntity } from '../common';

export interface Translation extends BaseEntity {
  locale: string;
  namespace: string;
  key: string;
  value: string;
}

export interface UpsertTranslationPayload {
  locale: string;
  namespace: string;
  key: string;
  value: string;
}