"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import type { MessageQueueItem } from "@/types";
import { MessageSquare, Check, Clock, AlertTriangle, Mail, Phone } from "lucide-react";

interface MessageHistoryProps {
  messages: MessageQueueItem[];
}

function extractEmailPreview(html: string): string {
  let text = html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.slice(0, 6).join("\n");
}

function isHtml(content: string): boolean {
  return content.trimStart().startsWith("<!DOCTYPE") || content.trimStart().startsWith("<html");
}

function getPreview(msg: MessageQueueItem): string {
  if (msg.channel === "email" && isHtml(msg.content)) {
    return extractEmailPreview(msg.content);
  }
  const text = msg.content.slice(0, 300);
  return text + (msg.content.length > 300 ? "..." : "");
}

const STATUS_ICON = {
  sent: <Check className="h-4 w-4 text-pulse-green" />,
  pending: <Clock className="h-4 w-4 text-pulse-yellow" />,
  failed: <AlertTriangle className="h-4 w-4 text-pulse-red" />,
  processing: <Clock className="h-4 w-4 text-pulse-yellow animate-spin" />,
} as const;

export function MessageHistory({ messages }: MessageHistoryProps) {
  if (messages.length === 0) {
    return (
      <Card className="text-center py-8">
        <MessageSquare className="h-8 w-8 text-pulse-muted mx-auto mb-3" />
        <p className="text-sm text-pulse-muted">No messages yet. Your first briefing arrives tomorrow at 8am ET.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <MessageRow key={msg.id} msg={msg} />
      ))}
    </div>
  );
}

function MessageRow({ msg }: { msg: MessageQueueItem }) {
  const preview = useMemo(() => getPreview(msg), [msg]);

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
          <p className="text-xs text-pulse-muted whitespace-pre-wrap leading-relaxed line-clamp-5">
            {preview}
          </p>
        </div>
      </div>
    </Card>
  );
}
