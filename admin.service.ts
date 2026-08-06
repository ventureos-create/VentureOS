import { collection, getCountFromServer, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export interface PlatformStats {
  totalUsers: number;
  verifiedUsers: number;
  totalPosts: number;
  totalBusinessPlans: number;
  totalMarketingPlans: number;
  totalConnections: number;
  totalChats: number;
  recentUsers: { displayName: string; email: string; createdAt: number }[];
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  const [
    usersCount,
    postsCount,
    plansCount,
    marketingCount,
    connectionsCount,
    chatsCount,
    recentUsersSnap,
    allUsersSnap,
  ] = await Promise.all([
    getCountFromServer(collection(db, "users")),
    getCountFromServer(collection(db, "posts")),
    getCountFromServer(collection(db, "businessPlans")),
    getCountFromServer(collection(db, "marketingPlans")),
    getCountFromServer(collection(db, "connections")),
    getCountFromServer(collection(db, "chats")),
    getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(8))),
    getDocs(collection(db, "users")),
  ]);

  const verifiedUsers = allUsersSnap.docs.filter((d) => d.data().emailVerified).length;

  const recentUsers = recentUsersSnap.docs.map((d) => {
    const data = d.data();
    return {
      displayName: data.displayName ?? "Unknown",
      email: data.email ?? "",
      createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
    };
  });

  return {
    totalUsers: usersCount.data().count,
    verifiedUsers,
    totalPosts: postsCount.data().count,
    totalBusinessPlans: plansCount.data().count,
    totalMarketingPlans: marketingCount.data().count,
    totalConnections: connectionsCount.data().count,
    totalChats: chatsCount.data().count,
    recentUsers,
  };
}
