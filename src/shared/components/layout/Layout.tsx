
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import MobileNavigation from './dashboard/MobileNavigation';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const path = location.pathname;
  
  // Previously, the AppSidebar was only shown on certain pages
  // We'll ensure it appears on all pages now
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {!isMobile && <AppSidebar />}
        <div className={`flex-1 min-h-screen ${isMobile ? 'pt-14' : ''}`}>
          {isMobile && <MobileNavigation />}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
