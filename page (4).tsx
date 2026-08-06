"use client";

import { useEffect, useState, FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { verifyPasswordResetCode } from "firebase/auth";
import { CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { auth } from "@/lib/firebase/config";
import { useAuth } from "@/hooks/useAuth";

function ResetPasswordInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { confirmPasswordReset } = useAuth();
  const oobCode = params.get("oobCode") ?? "";

  const [status, setStatus] = useState<"checking" | "valid" | "invalid" | "done">("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setStatus("invalid");
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then((verifiedEmail) => {
        setEmail(verifiedEmail);
        setStatus("valid");
      })
      .catch(() => setStatus("invalid"));
  }, [oobCode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPw) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset(oobCode, password);
      setStatus("done");
    } catch {
      setError("This reset link has expired. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "checking") {
    return (
      <AuthShell title="Reset your password" subtitle="">
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </AuthShell>
    );
  }

  if (status === "invalid") {
    return (
      <AuthShell title="Link expired" subtitle="This password reset link is invalid or has expired.">
        <Link href="/forgot-password">
          <Button className="w-full">Request a new link</Button>
        </Link>
      </AuthShell>
    );
  }

  if (status === "done") {
    return (
      <AuthShell title="Password updated" subtitle="">
        <div className="rounded-xl2 border border-navy-100 bg-white p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-royal-50">
            <CheckCircle2 className="h-6 w-6 text-royal" />
          </div>
          <p className="mt-4 text-sm text-navy-400">Your password has been reset successfully.</p>
          <Button className="mt-6 w-full" onClick={() => router.push("/login")}>
            Continue to log in
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle={`Resetting password for ${email}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">New password</label>
          <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Confirm password</label>
          <Input type="password" required minLength={6} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>
          Reset password
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner /></div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
