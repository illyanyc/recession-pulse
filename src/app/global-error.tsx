"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0f] text-gray-300 antialiased">
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <p className="text-7xl font-bold text-red-500 mb-4">500</p>
            <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
            <p className="text-gray-400 mb-8">
              A critical error occurred. Our team has been notified.
            </p>
            <button
              onClick={reset}
              className="px-6 py-2.5 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-colors"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
