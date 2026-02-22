"use client";

import { useState } from "react";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const TYPES = [
  { value: "bug", label: "Bug Report", icon: "🐛" },
  { value: "suggestion", label: "Feature Suggestion", icon: "💡" },
  { value: "question", label: "Question", icon: "❓" },
  { value: "other", label: "Other", icon: "📩" },
] as const;

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("bug");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, type, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send");
      }

      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
      setType("bug");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center py-16">
        <CheckCircle className="h-12 w-12 text-pulse-green mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Message Sent</h2>
        <p className="text-sm text-pulse-muted mb-6">
          Thanks for reaching out. We&apos;ll get back to you as soon as possible.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-sm text-pulse-green hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type selector */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          What&apos;s this about?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                type === t.value
                  ? "bg-pulse-green/10 border-pulse-green/40 text-pulse-green"
                  : "bg-pulse-dark border-pulse-border text-pulse-muted hover:border-pulse-green/20"
              }`}
            >
              <span className="block text-base mb-0.5">{t.icon}</span>
              <span className="text-xs">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-white mb-1.5">
          Name <span className="text-pulse-muted text-xs">(optional)</span>
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full bg-pulse-dark border border-pulse-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-pulse-muted/50 focus:outline-none focus:border-pulse-green/50 transition-colors"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-white mb-1.5">
          Email <span className="text-pulse-red">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-pulse-dark border border-pulse-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-pulse-muted/50 focus:outline-none focus:border-pulse-green/50 transition-colors"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-white mb-1.5">
          Message <span className="text-pulse-red">*</span>
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          maxLength={5000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            type === "bug"
              ? "Describe what happened, what you expected, and steps to reproduce..."
              : type === "suggestion"
                ? "Tell us about the feature you'd like to see..."
                : "What can we help with?"
          }
          className="w-full bg-pulse-dark border border-pulse-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-pulse-muted/50 focus:outline-none focus:border-pulse-green/50 transition-colors resize-none"
        />
        <p className="text-xs text-pulse-muted mt-1 text-right">{message.length}/5000</p>
      </div>

      {/* Error */}
      {status === "error" && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-pulse-red/10 border border-pulse-red/20">
          <AlertCircle className="h-4 w-4 text-pulse-red flex-shrink-0" />
          <p className="text-sm text-pulse-red">{errorMsg}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "sending" || !email || !message}
        className="w-full flex items-center justify-center gap-2 bg-pulse-green text-pulse-dark font-semibold py-3 rounded-lg hover:bg-pulse-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send Message
          </>
        )}
      </button>

      <p className="text-xs text-pulse-muted text-center">
        Your message will be sent to our team. We typically respond within 24 hours.
      </p>
    </form>
  );
}
