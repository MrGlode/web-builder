// Public API — core/http

// Models
export type { ApiResponse, ApiPaginatedResponse } from './lib/models/api-response.model';
export type { ApiError } from './lib/models/api-error.model';
export { ApiHttpError } from './lib/models/api-error.model';
export type { HttpRequestOptions } from './lib/models/http-request-options.model';

// Services
export { ApiClientService } from './lib/services/api-client.service';
export { LoadingService } from './lib/services/loading.service';

// Interceptors
export { errorInterceptor, SKIP_ERROR_HANDLING } from './lib/interceptors/error.interceptor';
export { loadingInterceptor, SKIP_LOADING } from './lib/interceptors/loading.interceptor';

// Providers
export { provideHttpCore } from './lib/providers/provide-http-core';