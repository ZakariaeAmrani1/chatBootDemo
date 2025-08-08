import React, { useState, useEffect } from "react";
import { X, FileText, Download, Eye, EyeOff, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FileAttachment } from "@shared/types";
import { ClientFileService } from "@/services/clientFileService";

interface PDFPreviewProps {
  pdfFile: FileAttachment;
  isOpen: boolean;
  onToggle: () => void;
  width: number;
  onWidthChange: (width: number) => void;
  className?: string;
}

export function PDFPreview({
  pdfFile,
  isOpen,
  onToggle,
  width,
  onWidthChange,
  className,
}: PDFPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(width);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load the file from IndexedDB and create a blob URL
  useEffect(() => {
    const loadFile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Extract file ID from the URL (format: blob:fileId)
        const fileId = pdfFile.url.replace("blob:", "");

        // Get the file blob from IndexedDB
        const fileBlob = await ClientFileService.serveFile(fileId);

        if (fileBlob) {
          // Create a proper blob URL
          const url = URL.createObjectURL(fileBlob);
          setBlobUrl(url);
        } else {
          setError("File not found in storage");
        }
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF file");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && pdfFile.url.startsWith("blob:")) {
      loadFile();
    } else if (isOpen) {
      // If it's already a proper URL, use it directly
      setBlobUrl(pdfFile.url);
      setIsLoading(false);
    }

    // Cleanup blob URL when component unmounts or file changes
    return () => {
      if (blobUrl && blobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [pdfFile.url, isOpen]);

  const handleDownload = async () => {
    try {
      if (blobUrl) {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = pdfFile.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Fallback: load file and download
        const fileId = pdfFile.url.replace("blob:", "");
        const fileBlob = await ClientFileService.serveFile(fileId);
        if (fileBlob) {
          const url = URL.createObjectURL(fileBlob);
          const link = document.createElement("a");
          link.href = url;
          link.download = pdfFile.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }
    } catch (err) {
      console.error("Error downloading file:", err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(width);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  // Add global mouse event listeners
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = startX - e.clientX;
      const newWidth = Math.min(
        Math.max(startWidth + deltaX, 320),
        window.innerWidth * 0.8,
      );
      onWidthChange(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, startX, startWidth, onWidthChange]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full bg-background border-l border-border shadow-lg z-20 flex flex-col",
        isOpen ? "" : "w-0",
        className,
      )}
      style={{
        width: isOpen
          ? window.innerWidth < 640
            ? "100vw"
            : `${width}px`
          : "0px",
        transition: isResizing ? "none" : "width 0.3s ease-in-out",
        minWidth: isOpen ? "320px" : "0px",
        maxWidth: isOpen ? "80vw" : "0px",
      }}
    >
      {/* Resize Handle */}
      <div
        className="absolute left-0 top-0 w-2 h-full cursor-col-resize hover:bg-primary/30 transition-colors group hidden sm:block border-r border-border/50"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border rounded p-1 shadow-lg">
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="h-4 w-4 text-red-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate" title={pdfFile.name}>
              {pdfFile.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(pdfFile.size)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={handleDownload}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Close PDF preview"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 relative bg-gray-50 dark:bg-gray-900">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-4 p-4 text-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Cannot load PDF
                </p>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download instead
              </Button>
            </div>
          </div>
        )}

        {blobUrl && !error && (
          <iframe
            src={`${blobUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full h-full border-none"
            title={`PDF Preview: ${pdfFile.name}`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError("Failed to display PDF");
            }}
          />
        )}

        {/* Fallback for browsers that don't support PDF viewing */}
        {!isLoading && !error && blobUrl && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-2">
                Can't view PDF inline?
              </p>
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download to view
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
