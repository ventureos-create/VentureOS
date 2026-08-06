"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function VerifyEmailPage() {
  const { user, userDoc, loading, resendVerification, refreshUser, logOut } = useAuth();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.emailVerified) {
      router.replace(userDoc?.onboardingComplete ? "/dashboard" : "/onboarding");
    }
  }, [user, userDoc, loading, router]);

  // Poll periodically in case the user verifies in another tab.
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUser();
    }, 4000);
    return () => clearInterval(interval);
  }, [refreshUser]);

  const handleResend = async () => {
    setSending(true);
    try {
      await resendVerification();
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  const handleCheck = async () => {
    setChecking(true);
    await refreshUser();
    setChecking(false);
  };

  return (
    <AuthShell title="Verify your email" subtitle="One quick step before you can access VentureOS.">
      <div className="rounded-xl2 border border-navy-100 bg-white p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-royal-50">
          <MailCheck className="h-6 w-6 text-royal" />
        </div>
        <p className="mt-4 text-sm text-navy-400">
          We sent a verification link to{" "}
          <span className="font-medium text-navy">{user?.email}</span>. Click the
          link, then come back here.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button onClick={handleCheck} loading={checking}>
            I&apos;ve verified — continue
          </Button>
          <Button variant="outline" onClick={handleResend} loading={sending} disabled={sent}>
            {sent ? "Verification email sent" : "Resend verification email"}
          </Button>
          <Button variant="ghost" onClick={logOut}>
            Sign out
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}
