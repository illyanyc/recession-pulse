"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Image from "next/image";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <Image src="/logo-transparent.png" alt="RecessionPulse" width={55} height={30} />
          <span className="text-2xl font-bold text-white">RecessionPulse</span>
        </Link>

        <div className="card">
          <h2 className="text-xl font-bold text-white mb-1 text-center">
            Set new password
          </h2>
          <p className="text-sm text-pulse-muted text-center mb-6">
            Choose a new password for your account.
          </p>

          {success ? (
            <div className="p-4 rounded-lg bg-pulse-green/10 border border-pulse-green/20 text-center">
              <p className="text-sm text-pulse-green font-medium mb-1">Password updated!</p>
              <p className="text-xs text-pulse-muted">Redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              <Input
                label="Confirm password"
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />

              {error && (
                <div className="p-3 rounded-lg bg-pulse-red/10 border border-pulse-red/20">
                  <p className="text-sm text-pulse-red">{error}</p>
                </div>
              )}

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Update password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
