"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Activity, Mail, Phone } from "lucide-react";
import Link from "next/link";

type AuthMode = "login" | "signup";
type AuthMethod = "email" | "phone";

interface AuthFormProps {
  mode: AuthMode;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const plan = searchParams.get("plan");

  const [method, setMethod] = useState<AuthMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"credentials" | "verify">("credentials");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const supabase = createClient();

  async function handleEmailAuth() {
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

  async function handlePhoneAuth() {
    setLoading(true);
    setError("");

    if (step === "credentials") {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          phone,
          password,
          options: { data: { full_name: fullName } },
        });

        if (error) {
          setError(error.message);
        } else {
          setStep("verify");
          setMessage("Enter the 6-digit code sent to your phone.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          phone,
          password,
        });

        if (error) {
          setError(error.message);
        } else {
          router.push(redirect);
          router.refresh();
        }
      }
    } else {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: mode === "signup" ? "sms" : "sms",
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (method === "email") {
      await handleEmailAuth();
    } else {
      await handlePhoneAuth();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <Activity className="h-8 w-8 text-pulse-green" />
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

          {/* Auth method toggle */}
          <div className="flex rounded-lg bg-pulse-dark border border-pulse-border p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMethod("email"); setStep("credentials"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                method === "email"
                  ? "bg-pulse-card text-white"
                  : "text-pulse-muted hover:text-white"
              }`}
            >
              <Mail className="h-4 w-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => { setMethod("phone"); setStep("credentials"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                method === "phone"
                  ? "bg-pulse-card text-white"
                  : "text-pulse-muted hover:text-white"
              }`}
            >
              <Phone className="h-4 w-4" />
              Phone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && step === "credentials" && (
              <Input
                label="Full name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}

            {method === "email" && (
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            )}

            {method === "phone" && step === "credentials" && (
              <Input
                label="Phone number"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            )}

            {step === "credentials" && (
              <Input
                label="Password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            )}

            {step === "verify" && (
              <Input
                label="Verification code"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            )}

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

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {mode === "login" ? "Sign in" : step === "verify" ? "Verify" : "Create account"}
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
    </div>
  );
}
