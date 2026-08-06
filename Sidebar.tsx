"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Brain,
  Newspaper,
  Users,
  MessageSquare,
  Megaphone,
  Bookmark,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/planner", label: "Planner", icon: Brain },
  { href: "/dashboard/community", label: "Community", icon: Newspaper },
  { href: "/dashboard/matching", label: "Co-Founders", icon: Users },
  { href: "/dashboard/marketing", label: "Marketing", icon: Megaphone },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, userDoc, isAdmin } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-navy-900 md:flex">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-6 py-5">
        <Image src="/logo.png" alt="VentureOS" width={28} height={28} className="rounded-lg" />
        <span className="font-display text-base font-bold text-white">
          Venture<span className="text-gold-400">OS</span>
        </span>
      </Link>

      <Link
        href={`/dashboard/profile/${user?.uid}`}
        className="mx-3 mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-3 transition-colors hover:bg-white/10"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gold-gradient text-xs font-bold text-navy-900">
          {userDoc?.photoURL ? (
            <Image src={userDoc.photoURL} alt="" width={36} height={36} className="h-full w-full object-cover" />
          ) : (
            (userDoc?.displayName ?? "F").slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{userDoc?.displayName ?? "Founder"}</p>
          <p className="truncate text-xs text-navy-100/50">View profile</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-royal text-white shadow-premium"
                  : "text-navy-100/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === "/admin"
                ? "bg-gold-500 text-navy-900"
                : "text-gold-300 hover:bg-gold-500/10"
            )}
          >
            <ShieldCheck className="h-[18px] w-[18px]" />
            Admin Panel
          </Link>
        )}
      </nav>

      <div className="m-3 rounded-xl border border-gold-500/25 bg-gradient-to-br from-royal-800/60 to-navy-900 p-4">
        <div className="flex items-center gap-2 text-gold-400">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wide">Upgrade to Pro</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-navy-100/60">
          Unlock unlimited plans, advanced tools, and more.
        </p>
        <button className="mt-3 w-full rounded-lg bg-gold-gradient py-2 text-xs font-bold text-navy-900">
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}
