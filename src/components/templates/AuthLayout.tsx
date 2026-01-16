/**
 * @fileoverview AuthLayout - Template para páginas de autenticación
 * Implementando principio de responsabilidad única para layouts
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface AuthLayoutProps {
  children: React.ReactNode;
  /** Título de la página */
  title?: string;
  /** Subtítulo o descripción */
  subtitle?: string;
  /** Imagen de fondo personalizada */
  backgroundImage?: string;
  /** Clases adicionales para el contenedor */
  className?: string;
}

/**
 * Template para páginas de autenticación con diseño centrado
 * Siguiendo principios de composición y reutilización
 */
export function AuthLayout({ 
  children, 
  title = "Bienvenido", 
  subtitle = "Accede a tu cuenta",
  backgroundImage,
  className 
}: AuthLayoutProps) {
  
  return (
    <div 
      className={cn(
        "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50",
        className
      )}
      style={backgroundImage ? { 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : undefined}
    >
      {/* Overlay para mejorar legibilidad si hay imagen de fondo */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/20" />
      )}
      
      <div className="relative w-full max-w-md mx-auto p-6">
        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Logo placeholder */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
              <svg 
                className="h-8 w-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" 
                />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
            
            <p className="text-gray-600">
              {subtitle}
            </p>
          </div>

          {/* Contenido principal */}
          <div>
            {children}
          </div>
        </div>

        {/* Footer opcional */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2026 GeoSpatial App. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}