'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinancialData } from '@/context/FinancialDataContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { GlobalSearchModal } from '@/components/layout/GlobalSearchModal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, currentClient } = useFinancialData();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (currentClient.isFirstTimeLogin) {
      router.push('/change-password');
    }
  }, [isAuthenticated, currentClient, router]);

  if (!isAuthenticated || currentClient.isFirstTimeLogin) {
    return null;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="main-content">
        <TopHeader onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
        <main className="page-body">
          {children}
        </main>
      </div>

      {/* Global Search Command Palette */}
      <GlobalSearchModal />
    </div>
  );
}
