"use client";

import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard": "Home",
  "/dashboard/planner": "Business Planner",
  "/dashboard/marketing": "Marketing Playbook",
  "/dashboard/community": "Community",
  "/dashboard/matching": "Co-Founder Matching",
  "/dashboard/messages": "Messages",
  "/dashboard/bookmarks": "Bookmarks",
  "/dashboard/settings": "Settings",
};

function titleFor(pathname: string): string {
  if (titles[pathname]) return titles[pathname];
  if (pathname.startsWith("/dashboard/profile")) return "Profile";
  if (pathname.startsWith("/dashboard/planner")) return "Business Plan";
  if (pathname.startsWith("/dashboard/marketing")) return "Marketing Playbook";
  return "VentureOS";
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-surface-light">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar title={titleFor(pathname)} />
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
