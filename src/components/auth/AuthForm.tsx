"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Image from "next/image";
import Link from "next/link";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  mode: AuthMode;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const plan = searchParams.get("plan");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const supabase = createClient();

  async function handleGoogleAuth() {
    setGoogleLoading(true);
    setError("");

    const redirectTo = `${window.location.origin}/api/auth/callback?redirect=${redirect}${plan ? `&plan=${plan}` : ""}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=${redirect}${plan ? `&plan=${plan}` : ""}`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for a confirmation link!");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push(redirect);
        router.refresh();
      }
    }

    setLoading(false);
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Enter your email address first.");
      return;
    }
    setResetLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your email for a password reset link!");
    }
    setResetLoading(false);
  }

  if (showReset) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md flex-1 flex flex-col justify-center">
          <Link href="/" className="flex items-center gap-2 justify-center mb-8">
            <Image src="/logo-transparent.png" alt="RecessionPulse" width={55} height={30} />
            <span className="text-2xl font-bold text-white">RecessionPulse</span>
          </Link>

          <div className="card">
            <h2 className="text-xl font-bold text-white mb-1 text-center">Reset your password</h2>
            <p className="text-sm text-pulse-muted text-center mb-6">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {error && (
                <div className="p-3 rounded-lg bg-pulse-red/10 border border-pulse-red/20">
                  <p className="text-sm text-pulse-red">{error}</p>
                </div>
              )}

              {message && (
                <div className="p-3 rounded-lg bg-pulse-green/10 border border-pulse-green/20">
                  <p className="text-sm text-pulse-green">{message}</p>
                </div>
              )}

              <Button type="submit" loading={resetLoading} className="w-full" size="lg">
                Send reset link
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setShowReset(false); setError(""); setMessage(""); }}
                className="text-sm text-pulse-green hover:underline"
              >
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md flex-1 flex flex-col justify-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <Image src="/logo-transparent.png" alt="RecessionPulse" width={55} height={30} />
          <span className="text-2xl font-bold text-white">RecessionPulse</span>
        </Link>

        <div className="card">
          <h2 className="text-xl font-bold text-white mb-1 text-center">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-sm text-pulse-muted text-center mb-6">
            {mode === "login"
              ? "Sign in to access your dashboard"
              : "Start monitoring recession indicators today"}
          </p>

          {/* Terms agreement — shown first on signup */}
          {mode === "signup" && (
            <div className={`relative mb-6 p-4 rounded-xl border transition-colors ${
              agreedToTerms
                ? "border-pulse-green/30 bg-pulse-green/5"
                : "border-pulse-yellow/30 bg-pulse-yellow/5"
            }`}>
              {!agreedToTerms && (
                <span className="absolute -left-2 top-4 text-pulse-yellow animate-bounce-x text-lg" aria-hidden="true">
                  &rarr;
                </span>
              )}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-pulse-border bg-pulse-card text-pulse-green focus:ring-pulse-green shrink-0 accent-emerald-500"
                />
                <span className="text-xs text-pulse-muted leading-relaxed group-hover:text-pulse-text transition-colors">
                  I agree to the{" "}
                  <Link href="/terms" target="_blank" className="text-pulse-green hover:underline">Terms of Service</Link>,{" "}
                  <Link href="/privacy" target="_blank" className="text-pulse-green hover:underline">Privacy Policy</Link>, and{" "}
                  <Link href="/disclaimer" target="_blank" className="text-pulse-green hover:underline">Investment Disclaimer</Link>.
                  I understand this is not investment advice.
                </span>
              </label>
            </div>
          )}

          {/* Google OAuth */}
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full gap-3"
            onClick={handleGoogleAuth}
            loading={googleLoading}
            disabled={mode === "signup" && !agreedToTerms}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-pulse-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-pulse-card px-3 text-pulse-muted">or continue with email</span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "signup" && (
              <Input
                label="Full name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => { setShowReset(true); setError(""); setMessage(""); }}
                  className="mt-1.5 text-xs text-pulse-green hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-pulse-red/10 border border-pulse-red/20">
                <p className="text-sm text-pulse-red">{error}</p>
              </div>
            )}

            {message && (
              <div className="p-3 rounded-lg bg-pulse-green/10 border border-pulse-green/20">
                <p className="text-sm text-pulse-green">{message}</p>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
              disabled={mode === "signup" && !agreedToTerms}
            >
              {mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            {mode === "login" ? (
              <p className="text-sm text-pulse-muted">
                Don&apos;t have an account?{" "}
                <Link href={`/signup${plan ? `?plan=${plan}` : ""}`} className="text-pulse-green hover:underline">
                  Sign up
                </Link>
              </p>
            ) : (
              <p className="text-sm text-pulse-muted">
                Already have an account?{" "}
                <Link href="/login" className="text-pulse-green hover:underline">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-md pt-8 pb-4 flex flex-col items-center gap-2">
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-xs text-pulse-muted hover:text-pulse-green transition-colors">Privacy</Link>
          <Link href="/terms" className="text-xs text-pulse-muted hover:text-pulse-green transition-colors">Terms</Link>
          <Link href="/disclaimer" className="text-xs text-pulse-muted hover:text-pulse-green transition-colors">Disclaimer</Link>
        </div>
        <p className="text-xs text-pulse-muted text-center">Not investment advice.</p>
      </div>
    </div>
  );
}
