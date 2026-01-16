/**
 * @fileoverview Página principal del dashboard
 */

'use client';

import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/templates';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Main dashboard page combining multiple organisms
 * Following composition principle
 */
export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  /**
   * Redirect to login if not authenticated
   */
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while auth state is being verified
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Do not render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const breadcrumbs = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Dashboard' }
  ];

  return (
    <DashboardLayout 
      pageTitle="Dashboard"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-8">
        {/* Welcome header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Hello, {user.name || user.email.split('@')[0]}! 👋
              </h1>
              <p className="text-gray-600">
                Welcome back to your geospatial analysis control panel.
                Here's a summary of your most recent data.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12" />
                </svg>
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

/**
 * Componente para mostrar items de actividad
 */
interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  time: string;
  type: 'success' | 'info' | 'warning';
}

function ActivityItem({ icon, title, time, type }: ActivityItemProps) {
  const bgColors = {
    success: 'bg-green-50',
    info: 'bg-blue-50',
    warning: 'bg-orange-50'
  };

  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
      <div className={`p-1.5 rounded-lg ${bgColors[type]}`}>
        {icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {title}
        </p>
        <p className="text-xs text-gray-500">
          {time}
        </p>
      </div>
    </div>
  );
}