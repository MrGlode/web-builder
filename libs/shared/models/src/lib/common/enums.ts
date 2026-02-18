export enum SiteStatus {
  Draft = 'draft',
  Active = 'active',
  Archived = 'archived',
}

export enum PageStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

export enum VersionStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  Approved = 'approved',
  Published = 'published',
  Rejected = 'rejected',
}

export enum BlockSourceType {
  DesignSystemComponent = 'ds_component',
  MicroFrontend = 'micro_frontend',
}

export enum MfeEnvironment {
  Dev = 'dev',
  Staging = 'staging',
  Prod = 'prod',
}