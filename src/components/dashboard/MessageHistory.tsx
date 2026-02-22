"use client";

import { Card } from "@/components/ui/Card";
import type { MessageQueueItem } from "@/types";
import { MessageSquare, Check, Clock, AlertTriangle } from "lucide-react";

interface MessageHistoryProps {
  messages: MessageQueueItem[];
}

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
        <Card key={msg.id} className="p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {msg.status === "sent" && <Check className="h-4 w-4 text-pulse-green" />}
              {msg.status === "pending" && <Clock className="h-4 w-4 text-pulse-yellow" />}
              {msg.status === "failed" && <AlertTriangle className="h-4 w-4 text-pulse-red" />}
              {msg.status === "processing" && <Clock className="h-4 w-4 text-pulse-yellow animate-spin" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-white uppercase">
                  {msg.message_type.replace("_", " ")}
                </span>
                <span className="text-xs text-pulse-muted">
                  via {msg.channel}
                </span>
                <span className="text-xs text-pulse-muted ml-auto">
                  {msg.sent_at
                    ? new Date(msg.sent_at).toLocaleString()
                    : new Date(msg.scheduled_for).toLocaleString()}
                </span>
              </div>
              <pre className="text-xs text-pulse-muted whitespace-pre-wrap font-sans leading-relaxed">
                {msg.content.slice(0, 200)}
                {msg.content.length > 200 && "..."}
              </pre>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
