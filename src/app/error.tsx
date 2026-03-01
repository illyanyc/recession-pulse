"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-pulse-darker flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-7xl font-bold text-red-500 mb-4">500</p>
        <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
        <p className="text-pulse-muted mb-8">
          An unexpected error occurred. Our team has been notified.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-pulse-green text-black font-semibold rounded-lg hover:bg-pulse-green/90 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => { window.location.href = "/"; }}
            className="px-6 py-2.5 bg-pulse-card border border-pulse-border text-white font-semibold rounded-lg hover:border-pulse-green/30 transition-colors"
          >
            Go home
          </button>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-pulse-muted/50">Error ID: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
