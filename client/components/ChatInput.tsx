import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Send,
  Paperclip,
  Mic,
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
        message.trim() || (attachedFiles.length > 0 ? "" : ""),
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
          console.log('Files uploaded successfully:', response.data);
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
          console.log('Using fallback file URLs:', newFiles);
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
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

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

        // Stop all tracks
        stream.getTracks().forEach(track => {
          track.stop();
        });
      };

      mediaRecorder.start(100); // Collect data every 100ms
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  }, []);

  const handleAudioRecorded = async (audioBlob: Blob) => {
    if (audioBlob.size < 1000) {
      console.warn('Audio recording too short, ignoring');
      return;
    }

    setIsUploading(true);

    try {
      // SIMULATION MODE - Just send a text message indicating audio was recorded
      console.log('Audio recorded (simulated):', audioBlob.size, 'bytes');

      // Simulate a short delay for "processing"
      await new Promise(resolve => setTimeout(resolve, 500));

      // Send a simulated audio message without actual file
      onSendMessage('🎤 Voice message (simulated)', []);

      // Clean up the blob URL
      URL.revokeObjectURL(URL.createObjectURL(audioBlob));

    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsUploading(false);
      setRecordingTime(0);
    }
  };



  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clean up recording when component unmounts
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      // Cleanup any object URLs
      attachedFiles.forEach(file => {
        if (file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [isRecording, attachedFiles]);

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
                  {isRecording ? (
                    <button
                      type="button"
                      className="transition-all duration-300 hover:scale-105 cursor-pointer"
                      onClick={stopRecording}
                      disabled={isSending || disabled || isUploading}
                      title="Click to stop recording and send"
                    >
                      <div className="wave-container oscilloscope">
                        <div className="wave-bar"></div>
                        <div className="wave-bar"></div>
                        <div className="wave-bar"></div>
                        <div className="wave-bar"></div>
                        <div className="wave-bar"></div>
                        <div className="wave-bar"></div>
                      </div>
                    </button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0 rounded-lg transition-all duration-200",
                        hasPermission === false
                          ? "text-red-400 hover:bg-red-50"
                          : "hover:bg-muted text-muted-foreground",
                      )}
                      onClick={startRecording}
                      disabled={isSending || disabled || isUploading}
                      title={hasPermission === false ? "Microphone permission required" : "Start recording"}
                    >
                      {hasPermission === false ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Send Button */}
              <Button
                type={isRecording ? "button" : "submit"}
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 rounded-lg transition-all duration-300",
                  "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                  "shadow-md hover:shadow-lg disabled:opacity-50",
                  "transform hover:scale-110 active:scale-95",
                  isSending && "animate-pulse",
                )}
                onClick={isRecording ? stopRecording : undefined}
                disabled={
                  (!message.trim() && attachedFiles.length === 0 && !isRecording) ||
                  isSending ||
                  disabled ||
                  isUploading
                }
                title={isRecording ? "Stop recording and send" : "Send message"}
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
