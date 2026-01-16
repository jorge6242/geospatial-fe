/**
 * @fileoverview Componente QuickActions - Organismo para acciones rápidas
 */

'use client';

import React from 'react';
import { Button } from '@/components/atoms';

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

/**
 * Componente para una acción rápida individual
 */
function ActionCard({ title, description, icon, onClick, variant = 'primary' }: ActionCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-blue-600">{icon}</div>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {description}
          </p>
          
          <Button
            variant={variant}
            size="sm"
            onClick={onClick}
          >
            Comenzar
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente que muestra acciones rápidas en el dashboard
 */
export function QuickActions() {
  const actions = [
    {
      title: 'Nuevo Análisis',
      description: 'Crea un nuevo análisis geoespacial con tus datos',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: () => console.log('Nuevo análisis')
    },
    {
      title: 'Cargar Datos',
      description: 'Importa nuevos conjuntos de datos geoespaciales',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      onClick: () => console.log('Cargar datos'),
      variant: 'secondary' as const
    },
    {
      title: 'Ver Reportes',
      description: 'Revisa los reportes generados recientemente',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      onClick: () => console.log('Ver reportes'),
      variant: 'secondary' as const
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {actions.map((action, index) => (
          <ActionCard key={index} {...action} />
        ))}
      </div>
    </div>
  );
}