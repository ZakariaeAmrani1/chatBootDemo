import React, { useState, useRef } from 'react';
import { Send, Paperclip, Mic, Square, Image, FileText, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ModelSelector } from '@/components/ModelSelector';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isSending) {
      setIsSending(true);
      
      // Animate the message send
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.transform = 'scale(0.98)';
        textarea.style.opacity = '0.7';
      }
      
      // Send the message
      onSendMessage(message.trim());
      
      // Clear and reset
      setTimeout(() => {
        setMessage('');
        setAttachedFiles([]);
        setIsSending(false);
        
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.transform = 'scale(1)';
          textarea.style.opacity = '1';
          textarea.focus();
        }
      }, 300);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-border bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Attached Files Display */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-muted px-4 py-2 rounded-xl text-sm border animate-in slide-in-from-bottom-2 duration-300"
              >
                {file.type.startsWith('image/') ? (
                  <Image className="h-4 w-4 text-blue-500" />
                ) : (
                  <FileText className="h-4 w-4 text-green-500" />
                )}
                <span className="truncate max-w-32 font-medium">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 ml-1 hover:bg-destructive/10 hover:text-destructive rounded-full"
                  onClick={() => removeFile(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Main Input Area */}
        <form onSubmit={handleSubmit} className="relative">
          <div className={cn(
            "relative border-2 rounded-2xl bg-background overflow-hidden transition-all duration-300",
            "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40",
            "hover:border-border/60",
            isSending ? "border-primary/40 ring-2 ring-primary/20" : "border-border"
          )}>
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Message ChatGPT..."
              disabled={isSending}
              className={cn(
                "resize-none border-0 bg-transparent px-6 py-5 pr-32 focus:ring-0 min-h-[60px] max-h-[200px]",
                "text-foreground placeholder:text-muted-foreground text-base leading-relaxed",
                "transition-all duration-300",
                isSending && "opacity-70"
              )}
              rows={1}
            />
            
            {/* Character counter */}
            <div className="absolute top-3 right-20 text-xs text-muted-foreground">
              {message.length}/4000
            </div>
            
            {/* Action Buttons */}
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              {/* Attachment Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 hover:bg-muted rounded-xl transition-all duration-200 hover:scale-110"
                    disabled={isSending}
                  >
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleFileUpload}>
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    Upload file
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {/* Handle photo upload */}}>
                    <Image className="h-4 w-4 mr-2 text-green-500" />
                    Upload photo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {/* Handle camera */}}>
                    <Camera className="h-4 w-4 mr-2 text-purple-500" />
                    Take photo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Voice Recording */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-10 w-10 p-0 rounded-xl transition-all duration-200 hover:scale-110",
                  isRecording 
                    ? "text-red-500 bg-red-50 hover:bg-red-100 animate-pulse" 
                    : "hover:bg-muted text-muted-foreground"
                )}
                onClick={toggleRecording}
                disabled={isSending}
              >
                {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              {/* Send Button */}
              <Button
                type="submit"
                size="sm"
                className={cn(
                  "h-10 w-10 p-0 rounded-xl transition-all duration-300",
                  "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                  "shadow-lg hover:shadow-xl disabled:opacity-50",
                  "transform hover:scale-110 active:scale-95",
                  isSending && "animate-pulse"
                )}
                disabled={(!message.trim() && attachedFiles.length === 0) || isSending}
              >
                {isSending ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <Send className="h-5 w-5 text-white" />
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Model Selection */}
        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />

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
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          ChatGPT can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
