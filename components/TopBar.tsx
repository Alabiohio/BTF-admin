"use client";
import { usePathname } from "next/navigation";

interface TopBarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

export default function TopBar({ toggleSidebar, isSidebarOpen }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  
  let title = "Dashboard Overview";
  if (pathname === "/speakers") title = "Speakers Registration";
  if (pathname === "/exhibitors") title = "Exhibitors Registration";
  if (pathname === "/sponsors") title = "Sponsors Registration";
  if (pathname === "/volunteers") title = "Volunteers Registration";

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/sign-in");
  };

  return (
    <header className={`fixed top-0 right-0 z-30 w-full bg-white border-b border-gray-200 shadow-sm h-16 transition-all duration-300 ${isSidebarOpen ? "sm:w-[calc(100%-16rem)]" : "sm:w-full"}`}>
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 h-full">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSidebar}
            className="p-2 -ml-2 mr-1 rounded-md text-gray-500 hover:text-biro-blue hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-biro-blue"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <h1 className="text-lg sm:text-xl font-oswald font-semibold text-biro-blue-dark truncate max-w-[200px] sm:max-w-none">{title}</h1>
        </div>
        
        {session && (
          <div className="flex items-center">
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-biro-blue rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">{session.user.name || session.user.email?.split("@")[0]}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{session.user.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 rounded-b-lg"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
