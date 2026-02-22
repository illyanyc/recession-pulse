"use client";

import { useState } from "react";
import { Loader2, Check, Mail } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Something went wrong");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-pulse-green text-sm">
        <Check className="h-4 w-4" />
        Subscribed! Check your inbox.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
      <div className="relative flex-1 sm:w-64">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pulse-muted" />
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="your@email.com"
          required
          className="w-full pl-10 pr-4 py-2.5 bg-pulse-darker border border-pulse-border rounded-lg text-sm text-white placeholder:text-pulse-muted focus:outline-none focus:border-pulse-green/50 transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-4 py-2.5 bg-pulse-green text-pulse-darker rounded-lg text-sm font-semibold hover:bg-pulse-green/90 transition-colors disabled:opacity-50 flex-shrink-0"
      >
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Subscribe"
        )}
      </button>
      {status === "error" && (
        <p className="absolute -bottom-5 left-0 text-xs text-pulse-red">{errorMsg}</p>
      )}
    </form>
  );
}
