"use client";

import { Activity, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-pulse-darker/80 backdrop-blur-xl border-b border-pulse-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-pulse-green" />
            <span className="text-lg font-bold text-white">RecessionPulse</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm text-pulse-muted hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/#indicators" className="text-sm text-pulse-muted hover:text-white transition-colors">
              Indicators
            </Link>
            <Link href="/#pricing" className="text-sm text-pulse-muted hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-pulse-text"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {isOpen && (
          <div className="md:hidden border-t border-pulse-border py-4 space-y-3">
            <Link href="/#features" className="block px-2 py-2 text-sm text-pulse-muted hover:text-white" onClick={() => setIsOpen(false)}>
              Features
            </Link>
            <Link href="/#indicators" className="block px-2 py-2 text-sm text-pulse-muted hover:text-white" onClick={() => setIsOpen(false)}>
              Indicators
            </Link>
            <Link href="/#pricing" className="block px-2 py-2 text-sm text-pulse-muted hover:text-white" onClick={() => setIsOpen(false)}>
              Pricing
            </Link>
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full">Log in</Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button size="sm" className="w-full">Get started</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
