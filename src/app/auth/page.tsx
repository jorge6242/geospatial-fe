/**
 * @fileoverview Página de autenticación - Login y Registro
 * Combinando Template + Organismo para crear la página completa
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/components/templates';
import { LoginForm, RegisterForm } from '@/components/organisms';
import { useEffect } from 'react';

/**
 * Página de autenticación que maneja login y registro
 * Siguiendo principios de Single Responsibility y composición
 */
export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  /**
   * Redireccionar si ya está autenticado
   */
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  /**
   * Handler para auth exitosa
   */
  const handleAuthSuccess = () => {
    router.push('/dashboard');
  };

  /**
   * Handler para errores de auth
   */
  const handleAuthError = (error: string) => {
    console.error('Error de autenticación:', error);
    // Aquí podrías mostrar un toast o notificación global
  };

  /**
   * Cambiar entre login y registro
   */
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  // Mostrar loading mientras se verifica el estado de auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // No renderizar si ya está autenticado
  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthLayout
      title={isLogin ? "Welcome back" : "Create a new account"}
      subtitle={isLogin ? "Access your control panel" : "Join our platform"}
    >
      {isLogin ? (
        <div>
          <LoginForm 
            onSuccess={handleAuthSuccess}
            onError={handleAuthError}
          />
          
          {/* Link to switch to register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={toggleAuthMode}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      ) : (
        <RegisterForm 
          onSuccess={handleAuthSuccess}
          onError={handleAuthError}
          onSwitchToLogin={toggleAuthMode}
        />
      )}
    </AuthLayout>
  );
}