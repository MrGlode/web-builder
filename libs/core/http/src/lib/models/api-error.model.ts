export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path?: string;
}

export class ApiHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    override readonly message: string,
    public readonly details?: Record<string, unknown>,
    public readonly timestamp: string = new Date().toISOString(),
    public readonly path?: string
  ) {
    super(message);
    this.name = 'ApiHttpError';
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }
}