"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { Brain, Megaphone, Users, MessageSquare, Plus, ArrowRight, Heart, MessageCircle } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { subscribeToNotifications } from "@/services/notifications.service";
import { NotificationDoc, PostDoc } from "@/types";
import { timeAgo, initials } from "@/lib/utils";

export default function DashboardOverview() {
  const { user, userDoc } = useAuth();
  const [planCount, setPlanCount] = useState(0);
  const [marketingCount, setMarketingCount] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [recent, setRecent] = useState<NotificationDoc[]>([]);
  const [highlights, setHighlights] = useState<PostDoc[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [plans, marketing, connectionsA, connectionsB, posts, topPosts] = await Promise.all([
        getDocs(query(collection(db, "businessPlans"), where("userId", "==", user.uid))),
        getDocs(query(collection(db, "marketingPlans"), where("userId", "==", user.uid))),
        getDocs(query(collection(db, "connections"), where("fromId", "==", user.uid))),
        getDocs(query(collection(db, "connections"), where("toId", "==", user.uid))),
        getDocs(query(collection(db, "posts"), where("authorId", "==", user.uid))),
        getDocs(query(collection(db, "posts"), orderBy("likeCount", "desc"), limit(3))),
      ]);
      setPlanCount(plans.size);
      setMarketingCount(marketing.size);
      setConnectionCount(connectionsA.size + connectionsB.size);
      setPostCount(posts.size);
      setHighlights(
        topPosts.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
            updatedAt: data.updatedAt?.toMillis?.() ?? Date.now(),
          } as PostDoc;
        })
      );
      setLoadingStats(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return subscribeToNotifications(user.uid, (n) => setRecent(n.slice(0, 5)));
  }, [user]);

  const stats = [
    { label: "Business Plans", value: planCount, icon: Brain, href: "/dashboard/planner", tint: "bg-royal-50 text-royal-700" },
    { label: "Community Posts", value: postCount, icon: MessageSquare, href: "/dashboard/community", tint: "bg-emerald-50 text-emerald-700" },
    { label: "Connections", value: connectionCount, icon: Users, href: "/dashboard/matching", tint: "bg-purple-50 text-purple-700" },
    { label: "Marketing Plans", value: marketingCount, icon: Megaphone, href: "/dashboard/marketing", tint: "bg-gold-50 text-gold-700" },
  ];

  const firstName = (userDoc?.displayName ?? "Founder").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">{greeting}, {firstName} 👋</h1>
          <p className="mt-1 text-sm text-navy-400">Here&apos;s what&apos;s happening with your startup journey.</p>
        </div>
        <Link href="/dashboard/planner">
          <Button variant="primary">
            <Plus className="h-4 w-4" /> New
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-shadow hover:shadow-gold">
              <CardContent className="p-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.tint}`}>
                  <s.icon className="h-[18px] w-[18px]" />
                </div>
                <p className="mt-4 font-display text-2xl font-bold text-navy">
                  {loadingStats ? "—" : s.value}
                </p>
                <p className="text-sm text-navy-400">{s.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display text-base font-semibold text-navy">Recent Activity</h3>
            <div className="mt-4 divide-y divide-navy-50">
              {recent.length === 0 ? (
                <p className="py-8 text-center text-sm text-navy-300">
                  Nothing yet — activity from likes, comments, and connections will show up here.
                </p>
              ) : (
                recent.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 py-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-500" />
                    <div>
                      <p className="text-sm text-navy-500">{n.message}</p>
                      <p className="mt-0.5 text-xs text-navy-300">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-display text-base font-semibold text-navy">Community Highlights</h3>
            <div className="mt-4 space-y-4">
              {highlights.length === 0 ? (
                <p className="py-8 text-center text-sm text-navy-300">
                  No community posts yet — be the first to share something.
                </p>
              ) : (
                highlights.map((post) => (
                  <div key={post.id} className="border-b border-navy-50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-royal-50 text-xs font-semibold text-royal-700">
                        {post.authorPhotoURL ? (
                          <Image src={post.authorPhotoURL} alt="" width={32} height={32} className="h-full w-full object-cover" />
                        ) : (
                          initials(post.authorName)
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-navy">{post.authorName}</p>
                        <p className="text-[11px] text-navy-300">{timeAgo(post.createdAt)}</p>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-navy-500">{post.content}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-navy-300">
                      <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {post.likeCount}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {post.commentCount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link href="/dashboard/community" className="mt-4 flex items-center gap-1 text-xs font-semibold text-royal">
              View all activity <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
