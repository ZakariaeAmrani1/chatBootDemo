import React, { useState, useRef, useCallback } from "react";
import {
  Send,
  Paperclip,
  Mic,
  Square,
  Image,
  FileText,
  Camera,
  Loader2,
  X,
  MicOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import FileAttachmentDisplay from "@/components/FileAttachment";
import { cn } from "@/lib/utils";
import type { FileAttachment } from "@shared/types";
import { apiService } from "@/services/api";

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: FileAttachment[]) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
}) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachedFiles.length > 0) && !isSending) {
      setIsSending(true);

      // Animate the message send
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.transform = "scale(0.98)";
        textarea.style.opacity = "0.7";
      }

      // Send the message with attachments
      onSendMessage(
        message.trim(),
        attachedFiles.length > 0 ? attachedFiles : undefined,
      );

      // Clear and reset
      setTimeout(() => {
        setMessage("");
        setAttachedFiles([]);
        setIsSending(false);

        if (textarea) {
          textarea.style.height = "auto";
          textarea.style.transform = "scale(1)";
          textarea.style.opacity = "1";
          textarea.focus();
        }
      }, 300);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (files && files.length > 0) {
      setIsUploading(true);

      try {
        const filesArray = Array.from(files);
        const response = await apiService.uploadFiles(filesArray);

        if (response.success && response.data) {
          setAttachedFiles((prev) => [...prev, ...response.data!]);
        } else {
          console.error("Failed to upload files:", response.error);
          // Fallback to local URLs for now
          const newFiles = filesArray.map((file) => {
            const fileAttachment: FileAttachment = {
              id:
                Date.now().toString() + Math.random().toString(36).substr(2, 9),
              name: file.name,
              type: file.type,
              size: file.size,
              url: URL.createObjectURL(file),
              uploadedAt: new Date().toISOString(),
            };
            return fileAttachment;
          });
          setAttachedFiles((prev) => [...prev, ...newFiles]);
        }
      } catch (error) {
        console.error("Error uploading files:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setHasPermission(false);
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (hasPermission === null) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    } else if (hasPermission === false) {
      alert('Microphone permission is required to record audio. Please enable it in your browser settings.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioRecorded(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please check your microphone permissions.');
    }
  }, [hasPermission]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  const handleAudioRecorded = async (audioBlob: Blob) => {
    setIsUploading(true);

    try {
      // Create a file from the blob
      const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, {
        type: 'audio/webm'
      });

      // Upload the audio file
      const response = await apiService.uploadFiles([audioFile]);

      if (response.success && response.data) {
        setAttachedFiles(prev => [...prev, ...response.data!]);
        // Auto-send the audio message
        setTimeout(() => {
          onSendMessage('🎤 Audio message', response.data);
        }, 100);
      } else {
        console.error('Failed to upload audio:', response.error);
        // Fallback to local URL
        const audioAttachment: FileAttachment = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: `audio-${Date.now()}.webm`,
          type: 'audio/webm',
          size: audioBlob.size,
          url: URL.createObjectURL(audioBlob),
          uploadedAt: new Date().toISOString(),
        };
        setAttachedFiles(prev => [...prev, audioAttachment]);
        // Auto-send the audio message
        setTimeout(() => {
          onSendMessage('🎤 Audio message', [audioAttachment]);
        }, 100);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsUploading(false);
      setRecordingTime(0);
    }
  };

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Format recording time
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const removeFile = (attachmentId: string) => {
    setAttachedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === attachmentId);
      if (fileToRemove?.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter((f) => f.id !== attachmentId);
    });
  };

  return (
    <div className=" bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Attached Files Display */}
        {attachedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">
                Attachments ({attachedFiles.length})
              </h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setAttachedFiles([])}
              >
                Clear all
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attachedFiles.map((attachment) => (
                <div key={attachment.id} className="relative group">
                  <FileAttachmentDisplay
                    attachment={attachment}
                    variant="input"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-destructive/90"
                    onClick={() => removeFile(attachment.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Input Area */}
        <form onSubmit={handleSubmit}>
          <div
            className={cn(
              "relative border rounded-xl bg-background overflow-hidden transition-all duration-300",
              "hover:border-border/60",
              isSending ? "border-primary/40" : "border-border",
            )}
          >
            {/* First Row - Textarea */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Message ChatGPT..."
                disabled={isSending || disabled}
                className={cn(
                  "resize-none border-none focus:border-none focus-visible:ring-0 focus:outline-none focus:shadow-none",
                  "bg-transparent px-4 py-3 min-h-[44px] max-h-[200px]",
                  "text-foreground placeholder:text-muted-foreground text-sm leading-relaxed",
                  "transition-all duration-300",
                  isSending && "opacity-70",
                )}
                rows={1}
              />

              {/* Character counter */}
              <div className="absolute top-2 right-4 text-xs text-muted-foreground">
                {message.length}/4000
              </div>
            </div>

            {/* Second Row - Action Buttons */}
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-1">
                {/* Attachment Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-muted rounded-lg transition-all duration-200 hover:scale-110"
                      disabled={isSending || disabled || isUploading}
                    >
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={handleFileUpload}>
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      Upload file
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.multiple = true;
                        input.onchange = (e) =>
                          handleFileSelect(
                            (e.target as HTMLInputElement).files,
                          );
                        input.click();
                      }}
                    >
                      <Image className="h-4 w-4 mr-2 text-green-500" />
                      Upload photo
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        /* Handle camera */
                      }}
                    >
                      <Camera className="h-4 w-4 mr-2 text-purple-500" />
                      Take photo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Voice Recording */}
                <div className="relative flex items-center gap-2">
                  {isRecording && (
                    <div className="flex items-center gap-2 text-xs text-red-500 font-mono">
                      <div className="relative">
                        <div className="w-2 h-2 bg-red-500 rounded-full recording-indicator" />
                        <div className="absolute inset-0 w-2 h-2 bg-red-500/30 rounded-full recording-ripple" />
                      </div>
                      <span className="font-semibold">REC {formatRecordingTime(recordingTime)}</span>
                    </div>
                  )}
                  <div className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0 rounded-lg transition-all duration-300 relative overflow-hidden",
                        isRecording
                          ? "text-red-500 bg-red-50 hover:bg-red-100 scale-110 shadow-lg border border-red-200"
                          : hasPermission === false
                          ? "text-red-400 hover:bg-red-50"
                          : "hover:bg-muted text-muted-foreground hover:scale-110",
                      )}
                      onClick={toggleRecording}
                      disabled={isSending || disabled || isUploading}
                      title={hasPermission === false ? "Microphone permission required" : isRecording ? "Stop recording" : "Start recording"}
                    >
                      {/* Multiple ripple effects for recording */}
                      {isRecording && (
                        <>
                          <div className="absolute inset-0 bg-red-500/15 rounded-lg animate-ping" style={{ animationDelay: '0s' }} />
                          <div className="absolute inset-0 bg-red-500/10 rounded-lg animate-ping" style={{ animationDelay: '0.5s' }} />
                          <div className="absolute inset-0 bg-red-500/5 rounded-lg animate-ping" style={{ animationDelay: '1s' }} />
                        </>
                      )}
                      {isRecording ? (
                        <Square className="h-4 w-4 relative z-10 recording-indicator" />
                      ) : hasPermission === false ? (
                        <MicOff className="h-4 w-4 relative z-10" />
                      ) : (
                        <Mic className="h-4 w-4 relative z-10" />
                      )}
                    </Button>

                    {/* Outer ripple ring for recording */}
                    {isRecording && (
                      <div className="absolute inset-0 border-2 border-red-500/30 rounded-lg recording-ripple" />
                    )}
                  </div>
                </div>
              </div>

              {/* Send Button */}
              <Button
                type="submit"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 rounded-lg transition-all duration-300",
                  "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                  "shadow-md hover:shadow-lg disabled:opacity-50",
                  "transform hover:scale-110 active:scale-95",
                  isSending && "animate-pulse",
                )}
                disabled={
                  (!message.trim() && attachedFiles.length === 0) ||
                  isSending ||
                  disabled ||
                  isUploading
                }
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Send className="h-4 w-4 text-white" />
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,application/pdf,.txt,.doc,.docx,.csv,.xlsx"
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        {/* Footer Text */}
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          ChatGPT can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
