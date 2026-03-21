'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Dashboard routes that require Sidebar and TopBar
  const dashboardRoutes = ['/live-map', '/fleet', '/dispatch', '/stock', '/events', '/demo'];
  const isDashboard = dashboardRoutes.some(route => pathname?.startsWith(route) || pathname === route);

  if (!isDashboard) {
    // For Landing, Register, Pricing: full width, no sidebar/topbar
    return (
      <main style={{ flex: 1, minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
        {children}
      </main>
    );
  }

  return (
    <>
      <Sidebar />
      <div style={{ 
        flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden',
        background: '#080E1A',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(6,182,212,0.008) 3px, rgba(6,182,212,0.008) 4px)'
      }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </>
  );
}
