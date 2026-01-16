/**
 * @fileoverview DashboardHeader - Header component for dashboard layout
 * Following Atomic Design and SOLID principles
 */

import React from 'react';
import { Button } from '@/components/atoms';
import { formatDate } from '@/lib/utils';

export interface DashboardHeaderProps {
  /** Page title */
  pageTitle: string;
  /** Optional breadcrumbs */
  breadcrumbs?: Array<{ label: string; href?: string }>;
  /** Sidebar open state */
  sidebarOpen: boolean;
  /** Toggle sidebar callback */
  onToggleSidebar: () => void;
  /** Logout callback */
  onLogout: () => void;
}

/**
 * Header component for dashboard with navigation and user actions
 * Implements composition principles for reusability
 */
export function DashboardHeader({
  pageTitle,
  breadcrumbs,
  sidebarOpen,
  onToggleSidebar,
  onLogout
}: DashboardHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            }
          />

          <div>
            <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
            {breadcrumbs && (
              <nav className="flex space-x-2 text-sm text-gray-500">
                {breadcrumbs.map((crumb, index) => (
                  <span key={index}>
                    {index > 0 && <span className="mx-2">/</span>}
                    {crumb.href ? (
                      <a href={crumb.href} className="hover:text-gray-700">
                        {crumb.label}
                      </a>
                    ) : (
                      crumb.label
                    )}
                  </span>
                ))}
              </nav>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {formatDate(new Date())}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            }
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}