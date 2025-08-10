import React, { useState, useEffect } from "react";
import { X, FileSpreadsheet, Download, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FileAttachment } from "@shared/types";

interface CSVPreviewProps {
  csvFile: FileAttachment;
  isOpen: boolean;
  onToggle: () => void;
  width: number;
  onWidthChange: (width: number) => void;
  className?: string;
}

interface CSVData {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

export function CSVPreview({
  csvFile,
  isOpen,
  onToggle,
  width,
  onWidthChange,
  className,
}: CSVPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(width);
  const [showRows, setShowRows] = useState(10);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = csvFile.url;
    link.download = csvFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const parseCSV = (text: string): CSVData => {
    // Handle different line endings and clean the text
    const normalizedText = text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();
    const lines = normalizedText
      .split("\n")
      .filter((line) => line.trim().length > 0);

    if (lines.length === 0) {
      throw new Error("CSV file is empty");
    }

    // Parse CSV considering potential commas in quoted values and escaped quotes
    const parseCSVLine = (line: string): string[] => {
      const result = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Escaped quote within quoted field
            current += '"';
            i++; // Skip the next quote
          } else {
            // Start or end of quoted field
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          result.push(current);
          current = "";
        } else {
          current += char;
        }
      }

      result.push(current);

      // Clean up the cells - remove surrounding quotes and trim
      return result.map((cell) => {
        let cleanCell = cell.trim();
        if (cleanCell.startsWith('"') && cleanCell.endsWith('"')) {
          cleanCell = cleanCell.slice(1, -1);
        }
        return cleanCell;
      });
    };

    const headers = parseCSVLine(lines[0]);
    const rows = lines
      .slice(1)
      .map((line) => parseCSVLine(line))
      .filter((row) => row.some((cell) => cell.trim().length > 0)); // Filter out empty rows

    return {
      headers,
      rows,
      totalRows: rows.length,
    };
  };

  const loadCSVData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Loading CSV from URL:", csvFile.url);

      const response = await fetch(csvFile.url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch CSV file: ${response.status} ${response.statusText}`,
        );
      }

      const text = await response.text();
      console.log("CSV text length:", text.length);
      console.log("CSV first 200 chars:", text.substring(0, 200));

      const data = parseCSV(text);
      console.log("Parsed CSV data:", data);
      setCsvData(data);
    } catch (err) {
      console.error("Error loading CSV:", err);
      setError(err instanceof Error ? err.message : "Failed to load CSV");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && csvFile) {
      loadCSVData();
    }
  }, [isOpen, csvFile.url]);

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
          <FileSpreadsheet className="h-4 w-4 text-purple-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate" title={csvFile.name}>
              {csvFile.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(csvFile.size)}
              {csvData && ` • ${csvData.totalRows} rows`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={handleDownload}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Download CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Close CSV preview"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* CSV Data Viewer */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading CSV...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center">
              <p className="text-sm text-red-600 mb-2">Failed to load CSV</p>
              <p className="text-xs text-muted-foreground mb-4">{error}</p>
              <div className="space-y-2">
                <Button onClick={loadCSVData} variant="outline" size="sm">
                  Try Again
                </Button>
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download to view
                </Button>
              </div>
            </div>
          </div>
        )}

        {csvData && (
          <div className="h-full flex flex-col">
            {/* Table Container */}
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-background border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      {csvData.headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-3 py-2 text-left font-medium text-muted-foreground border-r border-border last:border-r-0"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.rows.slice(0, showRows).map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-t border-border hover:bg-muted/30"
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-3 py-2 border-r border-border last:border-r-0 max-w-[200px] truncate"
                            title={cell}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {csvData.totalRows > showRows && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setShowRows((prev) =>
                        Math.min(prev + 10, csvData.totalRows),
                      )
                    }
                  >
                    Show more rows ({showRows} of {csvData.totalRows})
                  </Button>
                </div>
              )}
            </div>

            {/* Stats Footer */}
            <div className="border-t border-border p-4 bg-background/80 backdrop-blur-sm">
              <div className="text-xs text-muted-foreground">
                <p>
                  Columns: {csvData.headers.length} • Rows: {csvData.totalRows}
                </p>
                <p className="mt-1">
                  Showing {Math.min(showRows, csvData.totalRows)} rows
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
