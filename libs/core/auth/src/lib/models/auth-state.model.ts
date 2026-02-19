import { AuthUser } from './auth-user.model';

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
}

export const INITIAL_AUTH_STATE: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  isLoading: true,
};