import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-pulse-darker flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-7xl font-bold text-pulse-green mb-4">404</p>
          <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
          <p className="text-pulse-muted mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-2.5 bg-pulse-green text-black font-semibold rounded-lg hover:bg-pulse-green/90 transition-colors"
            >
              Go home
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-2.5 bg-pulse-card border border-pulse-border text-white font-semibold rounded-lg hover:border-pulse-green/30 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
