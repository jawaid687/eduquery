"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { uploadDocument } from "@/lib/api-client";
import type { Document } from "@/types";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onUploaded: (document: Document) => void;
}

export function UploadDropzone({ onUploaded }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are supported.");
        return;
      }
      setError(null);
      setIsUploading(true);
      try {
        const document = await uploadDocument(file);
        onUploaded(document);
      } catch {
        setError("Upload failed. Check that the backend is running.");
      } finally {
        setIsUploading(false);
      }
    },
    [onUploaded],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile],
  );

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-14 text-center transition-colors cursor-pointer",
          isDragging
            ? "border-primary bg-secondary"
            : "border-border bg-card hover:border-primary/50",
        )}
      >
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleInputChange}
          disabled={isUploading}
        />
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Extracting, chunking, and embedding your document...
            </p>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                Drop a lecture PDF here, or click to choose one
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                PDF only, up to 50MB
              </p>
            </div>
          </>
        )}
      </label>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}