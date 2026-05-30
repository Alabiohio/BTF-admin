"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 text-foreground">
       <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
       <TopBar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <main className="p-4 sm:p-6 sm:ml-64 mt-16 min-h-[calc(100vh-4rem)]">
        {children}
      </main>
      
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-900/50 sm:hidden" 
          onClick={closeSidebar}
        />
      )}
    </div>
  );
}
