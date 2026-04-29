"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import type { MessageQueueItem } from "@/types";
import { MessageSquare, Check, Clock, AlertTriangle, Mail, Phone, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";

interface MessageHistoryProps {
  messages: MessageQueueItem[];
}

const TABLE_CELL_SEP = " · ";

function stripHtmlToText(html: string): string {
  const replaced = html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h[1-6]|li|section|article|header|footer)>/gi, "\n")
    .replace(/<\/(td|th)>/gi, TABLE_CELL_SEP)
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, _href, inner) => inner)
    .replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  return replaced
    .split("\n")
    .map((line) =>
      line
        .replace(/\s+/g, " ")
        .replace(/(\s·\s)+/g, TABLE_CELL_SEP)
        .replace(/^\s*·\s*|\s*·\s*$/g, "")
        .trim(),
    )
    .filter((line) => line.length > 0 && line !== "·")
    .join("\n");
}

function isHtml(content: string): boolean {
  const trimmed = content.trimStart();
  return (
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<html") ||
    /^<(table|div|body|head)\b/i.test(trimmed)
  );
}

function getFullText(msg: MessageQueueItem): string {
  if (msg.channel === "email" && isHtml(msg.content)) {
    return stripHtmlToText(msg.content);
  }
  return msg.content;
}

const PREVIEW_LINES = 3;

function getPreview(fullText: string): string {
  const lines = fullText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const skipIntro = new Set([
    "RecessionPulse",
    "Real-time recession intelligence",
  ]);
  const meaningful = lines.filter((l) => !skipIntro.has(l));
  return meaningful.slice(0, PREVIEW_LINES).join("\n");
}

function isExpandable(fullText: string, preview: string): boolean {
  return fullText.length > preview.length + 20;
}

const STATUS_ICON = {
  sent: <Check className="h-4 w-4 text-pulse-green" />,
  pending: <Clock className="h-4 w-4 text-pulse-yellow" />,
  failed: <AlertTriangle className="h-4 w-4 text-pulse-red" />,
  processing: <Clock className="h-4 w-4 text-pulse-yellow animate-spin" />,
} as const;

const PAGE_SIZE = 5;

export function MessageHistory({ messages }: MessageHistoryProps) {
  const [page, setPage] = useState(0);

  if (messages.length === 0) {
    return (
      <Card className="text-center py-8">
        <MessageSquare className="h-8 w-8 text-pulse-muted mx-auto mb-3" />
        <p className="text-sm text-pulse-muted">No messages yet. Your first briefing arrives tomorrow at 7:15 AM ET.</p>
      </Card>
    );
  }

  const totalPages = Math.ceil(messages.length / PAGE_SIZE);
  const pageMessages = messages.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-3">
      {pageMessages.map((msg) => (
        <MessageRow key={msg.id} msg={msg} />
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-pulse-muted">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, messages.length)} of {messages.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-pulse-border text-pulse-muted hover:text-white hover:bg-pulse-dark transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                  i === page
                    ? "bg-pulse-green/10 text-pulse-green border border-pulse-green/20"
                    : "text-pulse-muted hover:text-white hover:bg-pulse-dark border border-pulse-border"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-1.5 rounded-lg border border-pulse-border text-pulse-muted hover:text-white hover:bg-pulse-dark transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageRow({ msg }: { msg: MessageQueueItem }) {
  const [expanded, setExpanded] = useState(false);
  const fullText = useMemo(() => getFullText(msg), [msg]);
  const preview = useMemo(() => getPreview(fullText), [fullText]);
  const canExpand = useMemo(() => isExpandable(fullText, preview), [fullText, preview]);

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {STATUS_ICON[msg.status] ?? STATUS_ICON.pending}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold text-white uppercase">
              {msg.message_type.replace("_", " ")}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-pulse-muted">
              {msg.channel === "email" ? <Mail className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
              {msg.channel}
            </span>
            <span className="text-xs text-pulse-muted ml-auto">
              {msg.sent_at
                ? new Date(msg.sent_at).toLocaleString()
                : new Date(msg.scheduled_for).toLocaleString()}
            </span>
          </div>

          <div
            className={`text-xs text-pulse-muted whitespace-pre-wrap leading-relaxed ${
              expanded
                ? "max-h-80 overflow-y-auto rounded-md border border-pulse-border bg-pulse-dark/40 p-3 font-mono"
                : "line-clamp-3"
            }`}
          >
            {expanded ? fullText : preview}
            {!expanded && canExpand && "…"}
          </div>

          {canExpand && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 inline-flex items-center gap-1 text-xs text-pulse-green hover:text-pulse-green/80 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Show full message
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
