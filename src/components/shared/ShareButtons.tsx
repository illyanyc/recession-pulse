"use client";

import { useState } from "react";
import { Check, Copy, Linkedin, MessageCircle } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-pulse-card border border-pulse-border text-sm text-pulse-text hover:border-pulse-green/30 hover:text-white transition-all"
      >
        <XIcon className="h-4 w-4" />
        Tweet
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-pulse-card border border-pulse-border text-sm text-pulse-text hover:border-pulse-green/30 hover:text-white transition-all"
      >
        <Linkedin className="h-4 w-4" />
        LinkedIn
      </a>
      <a
        href={`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-pulse-card border border-pulse-border text-sm text-pulse-text hover:border-pulse-green/30 hover:text-white transition-all"
      >
        <MessageCircle className="h-4 w-4" />
        Reddit
      </a>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-pulse-card border border-pulse-border text-sm text-pulse-text hover:border-pulse-green/30 hover:text-white transition-all"
      >
        {copied ? <Check className="h-4 w-4 text-pulse-green" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}
