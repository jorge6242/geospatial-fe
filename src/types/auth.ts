/**
 * @fileoverview Definición de tipos TypeScript para la autenticación
 * Siguiendo el principio de Single Responsibility (SOLID)
 */

// Tipos basados en la respuesta del backend
export interface User {
  id: string;
  email: string;
  name?: string; // Opcional porque el backend no lo incluye en login
  avatar?: string;
  createdAt: string; // ISO string del backend
  updatedAt: string; // ISO string del backend
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// Respuestas del backend
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterResponse {
  user: User;
  message: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}