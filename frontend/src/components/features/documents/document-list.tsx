"use client";

import Link from "next/link";
import { FileText, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Document } from "@/types";

interface DocumentListProps {
  documents: Document[];
}

const statusConfig: Record
  Document["status"],
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  ready: { label: "Ready", icon: CheckCircle2, className: "text-green-700 bg-green-50 border-green-200" },
  processing: { label: "Processing", icon: Loader2, className: "text-amber-700 bg-amber-50 border-amber-200" },
  pending: { label: "Pending", icon: Clock, className: "text-muted-foreground bg-muted border-border" },
  failed: { label: "Failed", icon: XCircle, className: "text-destructive bg-red-50 border-red-200" },
};

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        No documents uploaded yet. Upload a lecture PDF above to get started.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {documents.map((doc) => {
        const status = statusConfig[doc.status];
        const StatusIcon = status.icon;
        const isReady = doc.status === "ready";

        const content = (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{doc.filename}</p>
              <p className="text-xs text-muted-foreground">
                {doc.page_count > 0 ? `${doc.page_count} pages` : "--"}
              </p>
            </div>
            <Badge variant="outline" className={status.className}>
              <StatusIcon className={`mr-1 h-3 w-3 ${doc.status === "processing" ? "animate-spin" : ""}`} />
              {status.label}
            </Badge>
          </div>
        );

        return (
          <li key={doc.id}>
            {isReady ? (
              <Link href={`/study/${doc.id}`}>{content}</Link>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ul>
  );
}