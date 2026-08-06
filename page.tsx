"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users, FileText, Brain, Megaphone, Network, MessageSquare, ArrowLeft,
} from "lucide-react";
import { AdminRoute } from "@/components/AdminRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { fetchPlatformStats, PlatformStats } from "@/services/admin.service";
import { timeAgo } from "@/lib/utils";

function AdminPanelContent() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatformStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: "Total Users", value: stats.totalUsers, icon: Users },
        { label: "Verified Users", value: stats.verifiedUsers, icon: Users },
        { label: "Community Posts", value: stats.totalPosts, icon: FileText },
        { label: "Business Plans", value: stats.totalBusinessPlans, icon: Brain },
        { label: "Marketing Playbooks", value: stats.totalMarketingPlans, icon: Megaphone },
        { label: "Connections", value: stats.totalConnections, icon: Network },
        { label: "Active Chats", value: stats.totalChats, icon: MessageSquare },
      ]
    : [];

  return (
    <div className="min-h-screen bg-navy-900 pb-16">
      <header className="border-b border-white/10 bg-navy-900/95 backdrop-blur-md">
        <div className="container-px mx-auto flex h-16 max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="VentureOS" width={28} height={28} className="rounded-lg" />
            <span className="font-display text-base font-bold text-white">
              Venture<span className="text-gold-400">OS</span> <span className="font-normal text-white/50">Admin</span>
            </span>
          </div>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </div>
      </header>

      <div className="container-px mx-auto max-w-6xl pt-8">
        <h1 className="font-display text-2xl font-bold text-white">Platform analytics</h1>
        <p className="mt-1 text-sm text-white/50">Live counts across every VentureOS collection.</p>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner className="text-gold-400" /></div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((c) => (
                <Card key={c.label} className="border-white/10 bg-white/5">
                  <CardContent className="p-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/15">
                      <c.icon className="h-[18px] w-[18px] text-gold-400" />
                    </div>
                    <p className="mt-4 font-display text-2xl font-bold text-white">{c.value}</p>
                    <p className="text-sm text-white/50">{c.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-6 border-white/10 bg-white/5">
              <CardContent className="p-6">
                <h3 className="font-display text-lg font-semibold text-white">Newest sign-ups</h3>
                <div className="mt-4 divide-y divide-white/10">
                  {stats?.recentUsers.map((u, i) => (
                    <div key={i} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-white">{u.displayName}</p>
                        <p className="text-xs text-white/40">{u.email}</p>
                      </div>
                      <span className="text-xs text-white/40">{timeAgo(u.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminPanelContent />
    </AdminRoute>
  );
}
