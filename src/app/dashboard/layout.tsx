"use client";

import { BarChart3, Bell, Home, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/landing/Footer";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard#stocks", label: "Stock Screener", icon: BarChart3 },
  { href: "/dashboard#messages", label: "Messages", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-pulse-darker">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-pulse-darker/80 backdrop-blur-xl border-b border-pulse-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="RecessionPulse" width={28} height={28} className="rounded" />
            <span className="text-lg font-bold text-white">RecessionPulse</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  pathname === item.href
                    ? "bg-pulse-card text-white"
                    : "text-pulse-muted hover:text-white hover:bg-pulse-card/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-pulse-muted hover:text-white hover:bg-pulse-card/50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-pulse-darker/95 backdrop-blur-xl border-t border-pulse-border">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs transition-colors",
                pathname === item.href ? "text-pulse-green" : "text-pulse-muted"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
        {children}
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
