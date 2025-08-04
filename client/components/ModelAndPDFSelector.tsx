import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ModelSelectorCards } from "@/components/ModelSelectorCards";
import { PDFUpload } from "@/components/PDFUpload";
import { MessageSquare } from "lucide-react";

interface ModelAndPDFSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  onStartChat: (model: string, pdfFile: File) => void;
}

export function ModelAndPDFSelector({
  selectedModel,
  onModelChange,
  onStartChat,
}: ModelAndPDFSelectorProps) {
  const [selectedPDF, setSelectedPDF] = useState<File | null>(null);

  const handleStartChat = () => {
    if (selectedModel && selectedPDF) {
      onStartChat(selectedModel, selectedPDF);
    }
  };

  const canStartChat = selectedModel && selectedPDF;

  return (
    <div className="w-full max-w-4xl space-y-8">
      {/* Model Selection */}
      <ModelSelectorCards
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />

      {/* PDF Upload - Only show if model is selected */}
      {selectedModel && (
        <div className="animate-in fade-in duration-300">
          <PDFUpload onFileSelect={setSelectedPDF} selectedFile={selectedPDF} />
        </div>
      )}

      {/* Start Chat Button */}
      {selectedModel && (
        <div className="animate-in fade-in duration-300 flex justify-center">
          <Button
            onClick={handleStartChat}
            disabled={!canStartChat}
            size="lg"
            className="gap-2 px-8"
          >
            <MessageSquare className="w-5 h-5" />
            Start Chatting
          </Button>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>
          {!selectedModel
            ? "Select an AI model to get started"
            : !selectedPDF
              ? "Upload a PDF document to analyze"
              : "Ready to start your conversation!"}
        </p>
        {selectedModel && !selectedPDF && (
          <p className="text-xs">
            The AI will use your PDF to provide contextual answers and insights
          </p>
        )}
      </div>
    </div>
  );
}
