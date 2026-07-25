export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
  id: number;
  email: string;
  name: string;
  nickName?: string | null;
  active?: number | null;
  approve?: number | null;
  password?: string;
  roles: UserRole[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  provider: 'local' | 'google';
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
