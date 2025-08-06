import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ModelSelectorCards } from "@/components/ModelSelectorCards";
import { PDFUpload } from "@/components/PDFUpload";
import { CSVUpload } from "@/components/CSVUpload";
import { MessageSquare } from "lucide-react";
import { apiService } from "@/services/api";

interface ModelAndFileSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  onStartChat: (model: string, file: File) => void;
}

export function ModelAndFileSelector({
  selectedModel,
  onModelChange,
  onStartChat,
}: ModelAndFileSelectorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [models, setModels] = useState<any[]>([]);

  // Load models to get model details
  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await apiService.getModels();
        if (response.success && response.data) {
          setModels(response.data);
        }
      } catch (error) {
        console.error("Failed to load models:", error);
      }
    };
    loadModels();
  }, []);

  // Reset file selection when model changes
  useEffect(() => {
    setSelectedFile(null);
  }, [selectedModel]);

  const handleStartChat = () => {
    if (selectedModel && selectedFile) {
      onStartChat(selectedModel, selectedFile);
    }
  };

  const canStartChat = selectedModel && selectedFile;

  // Get the current model details
  const currentModel = models.find(m => m.id === selectedModel);
  const requiresPDF = selectedModel === 'local-cloud';
  const requiresCSV = selectedModel === 'csv-local';
  const requiresFile = requiresPDF || requiresCSV;

  // Determine file upload component and instructions
  const getFileUploadComponent = () => {
    if (requiresPDF) {
      return (
        <PDFUpload 
          onFileSelect={setSelectedFile} 
          selectedFile={selectedFile} 
        />
      );
    } else if (requiresCSV) {
      return (
        <CSVUpload 
          onFileSelect={setSelectedFile} 
          selectedFile={selectedFile} 
        />
      );
    }
    return null;
  };

  const getInstructions = () => {
    if (!selectedModel) {
      return "Select an AI model to get started";
    } else if (requiresFile && !selectedFile) {
      return requiresPDF 
        ? "Upload a PDF document to analyze"
        : "Upload a CSV dataset to analyze";
    } else if (requiresFile && selectedFile) {
      return "Ready to start your conversation!";
    } else {
      // For cloud model, no file required
      return "Ready to start your conversation!";
    }
  };

  const getDetailedInstructions = () => {
    if (!selectedModel || !requiresFile || selectedFile) return null;
    
    return requiresPDF
      ? "The AI will use your PDF to provide contextual answers and insights"
      : "The AI will analyze your CSV data to provide insights and answer questions";
  };

  return (
    <div className="w-full max-w-4xl space-y-8">
      {/* Model Selection */}
      <ModelSelectorCards
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />

      {/* File Upload - Only show if model requires a file */}
      {selectedModel && requiresFile && (
        <div className="animate-in fade-in duration-300">
          {getFileUploadComponent()}
        </div>
      )}

      {/* Start Chat Button */}
      {selectedModel && (
        <div className="animate-in fade-in duration-300 flex justify-center">
          <Button
            onClick={handleStartChat}
            disabled={requiresFile ? !canStartChat : !selectedModel}
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
        <p>{getInstructions()}</p>
        {getDetailedInstructions() && (
          <p className="text-xs">
            {getDetailedInstructions()}
          </p>
        )}
      </div>
    </div>
  );
}
