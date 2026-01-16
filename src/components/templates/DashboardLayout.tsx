/**
 * @fileoverview DashboardLayout - Template para el dashboard
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/atoms';
import { DashboardHeader } from '@/components/organisms';
import { cn, getAvatarFallback, formatDate } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  /** Título de la página actual */
  pageTitle?: string;
  /** Breadcrumbs opcionales */
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

/**
 * Template para el dashboard con sidebar y header
 */
export function DashboardLayout({ children, pageTitle = "Dashboard", breadcrumbs }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /**
   * Handler para cerrar sesión
   */
  const handleLogout = () => {
    logout();
  };

  /**
   * Navegación a diferentes secciones
   */
  const navigateToSection = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white shadow-lg border-r border-gray-200 transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          {sidebarOpen && (
            <span className="ml-3 text-lg font-semibold text-gray-800">
              GeoSpatial
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">

          <SidebarItem
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10z" />
              </svg>
            }
            label="Dashboard"
            active={pathname === '/dashboard'}
            collapsed={!sidebarOpen}
            onClick={() => navigateToSection('/dashboard')}
          />
          
          <SidebarItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            label="Mapas"
            active={pathname === '/dashboard/maps'}
            collapsed={!sidebarOpen}
            onClick={() => navigateToSection('/dashboard/maps')}
          />
        
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200">
          {user && (
            <div className={cn("flex items-center", sidebarOpen ? "space-x-3" : "justify-center")}>
              <img
                src={user.avatar || getAvatarFallback(user.name, user.email)}
                alt={`Avatar de ${user.name || user.email}`}
                className="w-8 h-8 rounded-full"
              />
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {user.name || user.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          pageTitle={pageTitle}
          breadcrumbs={breadcrumbs}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onLogout={handleLogout}
        />

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * Componente para items del sidebar
 */
interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon, label, active = false, collapsed = false, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center p-3 rounded-lg transition-colors",
        active 
          ? "bg-blue-50 text-blue-600 border border-blue-200" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
        collapsed && "justify-center"
      )}
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed && <span className="ml-3 font-medium">{label}</span>}
    </button>
  );
}