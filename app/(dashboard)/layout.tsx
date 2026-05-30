"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 640) {
        setIsSidebarOpen(false);
      }
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 text-foreground flex flex-col">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      <TopBar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <main className={`p-4 sm:p-6 mt-16 flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 ${isSidebarOpen ? "sm:ml-64" : ""}`}>
        {children}
      </main>
      <footer className={`bg-white border-t border-gray-200 py-4 transition-all duration-300 ${isSidebarOpen ? "sm:ml-64" : ""}`}>
        <div className="px-4 sm:px-6 flex items-center justify-center gap-2">
          <span className="text-slate-600 font-bold text-sm">Site by</span>
          <a 
            href="https://oheo.site" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <img src="/images/logo/oheo.png" alt="Oheo logo" className="w-13 h-13 object-contain" />
          </a>
        </div>
      </footer>
    </div>
  );
}
