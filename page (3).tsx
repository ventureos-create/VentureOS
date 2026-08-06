"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/layout/AuthShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { FirebaseError } from "firebase/app";

function friendlyError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Please choose a password with at least 6 characters.";
      case "auth/invalid-email":
        return "That email address doesn't look right.";
      default:
        return "Something went wrong. Please try again.";
    }
  }
  return "Something went wrong. Please try again.";
}

export default function SignupPage() {
  const { signUp, logInWithGoogle } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signUp(email, password, name);
      router.push("/verify-email");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await logInWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start building your venture in minutes.">
      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-navy-100 bg-white text-sm font-medium text-navy transition-colors hover:bg-navy-50 disabled:opacity-50"
      >
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-navy-100" />
        <span className="text-xs text-navy-300">or</span>
        <div className="h-px flex-1 bg-navy-100" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Full name</label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Founder" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Email</label>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Password</label>
          <Input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-navy-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-royal hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
