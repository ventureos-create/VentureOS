"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!user.emailVerified) {
      router.replace("/verify-email");
      return;
    }
    if (userDoc && !userDoc.onboardingComplete) {
      router.replace("/onboarding");
    }
  }, [user, userDoc, loading, router]);

  if (loading || !user || !user.emailVerified || (userDoc && !userDoc.onboardingComplete)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface-light dark:bg-surface-dark">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
