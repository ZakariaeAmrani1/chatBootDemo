import React from "react";
import {
  FileText,
  Image as ImageIcon,
  FileArchive,
  Download,
  Eye,
  Volume2,
  Play,
  Pause,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FileAttachment } from "@shared/types";

interface FileAttachmentProps {
  attachment: FileAttachment;
  className?: string;
  variant?: "input" | "chat";
}

const FileAttachmentDisplay: React.FC<FileAttachmentProps> = ({
  attachment,
  className,
  variant = "chat",
}) => {
  const isImage = attachment.type.startsWith("image/");
  const isPDF = attachment.type === "application/pdf";
  const isCSV =
    attachment.type === "text/csv" ||
    attachment.type === "application/csv" ||
    attachment.name.toLowerCase().endsWith(".csv");
  const isText = attachment.type.startsWith("text/") && !isCSV;
  const isAudio = attachment.type.startsWith("audio/");

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="h-4 w-4" />;
    if (isPDF) return <FileText className="h-4 w-4" />;
    if (isCSV) return <FileSpreadsheet className="h-4 w-4" />;
    if (isText) return <FileText className="h-4 w-4" />;
    if (isAudio) return <Volume2 className="h-4 w-4" />;
    return <FileArchive className="h-4 w-4" />;
  };

  const getFileColor = () => {
    if (isImage) return "text-blue-500";
    if (isPDF) return "text-red-500";
    if (isCSV) return "text-purple-500";
    if (isText) return "text-green-500";
    if (isAudio) return "text-purple-500";
    return "text-gray-500";
  };

  const handleDownload = () => {
    if (attachment.url) {
      const link = document.createElement("a");
      link.href = attachment.url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePreview = () => {
    if (attachment.url && (isImage || isPDF || isCSV)) {
      window.open(attachment.url, "_blank");
    }
  };

  // For audio files, show audio player
  if (isAudio && attachment.url) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
          <div className={cn("flex-shrink-0", getFileColor())}>
            <Volume2 className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">🎤 {attachment.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(attachment.size)} • Audio message
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <audio
          controls
          className="w-full h-8 rounded-lg"
          style={{ maxWidth: "300px" }}
        >
          <source src={attachment.url} type={attachment.type} />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  // For images, show preview
  if (isImage && attachment.url) {
    const imageClasses =
      variant === "input"
        ? "w-16 h-16 rounded-lg border border-border object-cover cursor-pointer hover:opacity-90 transition-opacity"
        : "max-w-xs max-h-64 rounded-lg border border-border object-cover cursor-pointer hover:opacity-90 transition-opacity";

    return (
      <div className={cn("space-y-2", className)}>
        <div className="relative group">
          <img
            src={attachment.url}
            alt={attachment.name}
            className={imageClasses}
            onClick={handlePreview}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/90 hover:bg-white text-black"
              onClick={handlePreview}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted rounded-lg text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn("flex-shrink-0", getFileColor())}>
              {getFileIcon()}
            </div>
            <span className="truncate font-medium">{attachment.name}</span>
            <span className="text-muted-foreground flex-shrink-0">
              {formatFileSize(attachment.size)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 flex-shrink-0"
            onClick={handleDownload}
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  // For other files, show file info
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border hover:bg-muted/80 transition-colors">
        <div className={cn("flex-shrink-0", getFileColor())}>
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attachment.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(attachment.size)} • {attachment.type}
          </p>
        </div>
        <div className="flex gap-1">
          {(isPDF || isText || isCSV) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handlePreview}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FileAttachmentDisplay;
