// Public API — core/auth

// Models
export type { AuthState } from './lib/models/auth-state.model';
export type { AuthUser } from './lib/models/auth-user.model';
export type { SfAuthConfig } from './lib/models/auth-config.model';
export { SF_AUTH_CONFIG } from './lib/models/auth-config.model';

// Services
export { AuthService } from './lib/services/auth.service';

// Guards
export { authGuard } from './lib/guards/auth.guard';
export { roleGuard } from './lib/guards/role.guard';

// Interceptors
export { tokenInterceptor } from './lib/interceptors/token.interceptor';

// Providers
export { provideAuth } from './lib/providers/provide-auth';