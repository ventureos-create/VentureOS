"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Search, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToNotifications, markNotificationRead } from "@/services/notifications.service";
import { NotificationDoc } from "@/types";
import { timeAgo, cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";

export function Topbar({ title }: { title: string }) {
  const { user, userDoc, logOut } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [open, setOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeToNotifications(user.uid, setNotifications);
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (n: NotificationDoc) => {
    if (!n.read) await markNotificationRead(n.id);
    setOpen(false);
    router.push(n.link);
  };

  const handleSignOut = async () => {
    await logOut();
    router.push("/login");
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/dashboard/matching?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-navy-100/70 bg-white/90 px-4 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-3 md:hidden">
        <button onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5 text-navy" />
        </button>
        <h1 className="font-display text-lg font-semibold text-navy">{title}</h1>
      </div>

      <form onSubmit={handleSearch} className="hidden max-w-sm flex-1 md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search VentureOS..."
            className="h-10 w-full rounded-lg border border-navy-100 bg-navy-50/50 pl-9 pr-4 text-sm text-navy placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-royal-400"
          />
        </div>
      </form>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => router.push("/dashboard/messages")}
          className="hidden h-10 w-10 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-50 md:flex"
          aria-label="Messages"
        >
          <MessageCircle className="h-5 w-5" />
        </button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-50"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-navy-900">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl2 border border-navy-100 bg-white shadow-premium">
              <div className="border-b border-navy-100 px-4 py-3">
                <p className="text-sm font-semibold text-navy">Notifications</p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-navy-300">You&apos;re all caught up.</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={cn(
                        "flex w-full flex-col items-start gap-0.5 border-b border-navy-50 px-4 py-3 text-left last:border-0 hover:bg-navy-50",
                        !n.read && "bg-royal-50/40"
                      )}
                    >
                      <span className="text-sm text-navy">{n.message}</span>
                      <span className="text-xs text-navy-300">{timeAgo(n.createdAt)}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSignOut}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-50"
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </button>

        <div className="ml-1 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-royal-gradient text-xs font-bold text-white">
          {userDoc?.photoURL ? (
            <Image src={userDoc.photoURL} alt="" width={36} height={36} className="h-full w-full object-cover" />
          ) : (
            (userDoc?.displayName ?? "F").slice(0, 1).toUpperCase()
          )}
        </div>
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-64 bg-white shadow-xl">
            <Sidebar />
          </div>
          <div className="flex-1 bg-navy-900/40" onClick={() => setMobileNavOpen(false)} />
        </div>
      )}
    </header>
  );
}
