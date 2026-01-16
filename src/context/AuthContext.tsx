/**
 * @fileoverview Context de autenticación usando servicios reales
 * Implementando principios de Dependency Injection y Single Responsibility
 */

'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { AuthState, AuthContextType, LoginCredentials, RegisterCredentials, User } from '@/types/auth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useLoginMutation, useRegisterMutation, useLogoutMutation } from '@/hooks/useAuthMutations';

// Estado inicial de la autenticación
const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Tipos de acciones del reducer
type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; accessToken: string; refreshToken?: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

/**
 * Reducer para manejar el estado de autenticación
 * Implementando patrón Redux/State Machine
 */
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
      
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken || state.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
      
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
      
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
      
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
      
    default:
      return state;
  }
}

// Context de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Provider de autenticación que maneja el estado global de auth
 * Usando servicios reales y TanStack Query
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const [storedToken, setStoredToken, removeStoredToken] = useLocalStorage<string>('auth_token');
  const [storedUser, setStoredUser, removeStoredUser] = useLocalStorage<User>('auth_user');

  // Mutations de TanStack Query
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  /**
   * Función para login usando el servicio real
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const result = await loginMutation.mutateAsync(credentials);
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: result.user, 
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        } 
      });
      
      // Persistir datos si "recordarme" está activado
      if (credentials.rememberMe) {
        setStoredToken(result.accessToken);
        setStoredUser(result.user);
        
        // Persistir refresh token también
        localStorage.setItem('refresh_token', result.refreshToken);
      } else {
        // Almacenar temporalmente en sesión aunque no sea "recordarme"
        localStorage.setItem('refresh_token', result.refreshToken);
      }
      
      return true;
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de autenticación';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return false;
    }
  }, [loginMutation, setStoredToken, setStoredUser]);

  /**
   * Función para registro usando el servicio real
   */
  const register = useCallback(async (credentials: RegisterCredentials): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });

    try {
      await registerMutation.mutateAsync(credentials);
      
      // Después del registro exitoso, podemos auto-logear
      const loginResult = await login({
        email: credentials.email,
        password: credentials.password,
        rememberMe: false
      });
      
      return loginResult;
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de registro';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return false;
    }
  }, [registerMutation, login]);

  /**
   * Función para logout
   */
  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
      dispatch({ type: 'AUTH_LOGOUT' });
      removeStoredToken();
      removeStoredUser();
      
      // Limpiar refresh token también
      localStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Error en logout:', error);
      // Logout local incluso si falla el servidor
      dispatch({ type: 'AUTH_LOGOUT' });
      removeStoredToken();
      removeStoredUser();
      localStorage.removeItem('refresh_token');
    }
  }, [logoutMutation, removeStoredToken, removeStoredUser]);

  /**
   * Función para refrescar autenticación desde localStorage
   */
  const refreshAuth = useCallback(async () => {
    if (storedToken && storedUser) {
      // Verificar si también tenemos refreshToken
      const refreshToken = localStorage.getItem('refresh_token');
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: storedUser, 
          accessToken: storedToken,
          refreshToken: refreshToken || undefined
        } 
      });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [storedToken, storedUser]);

  /**
   * Efecto para cargar usuario persistido al iniciar
   */
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar el contexto de autenticación
 * Implementando patrón de validación de contexto
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
}