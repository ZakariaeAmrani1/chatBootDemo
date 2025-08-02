import React, { useState, useRef } from 'react';
import { Send, Paperclip, Mic, Square, Image, FileText, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setAttachedFiles([]);
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
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
    // Here you would implement actual audio recording logic
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-border bg-gradient-to-t from-white via-gray-50 to-white p-6 shadow-2xl">
      <div className="max-w-4xl mx-auto">
        {/* Model Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              <SelectItem value="claude-3">Claude 3</SelectItem>
              <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-sm text-muted-foreground text-right">
            {message.length}/4000 characters
          </div>
        </div>

        {/* Attached Files Display */}
        {attachedFiles.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-lg text-sm"
              >
                {file.type.startsWith('image/') ? (
                  <Image className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                <span className="truncate max-w-32">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeFile(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative border border-gray-200 rounded-2xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-400 shadow-lg hover:shadow-xl transition-all duration-300">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Message ChatGPT..."
              className="resize-none border-0 bg-transparent px-6 py-5 pr-28 focus:ring-0 min-h-[64px] max-h-[200px] text-gray-900 placeholder:text-gray-500"
              rows={1}
            />
            
            {/* Action Buttons */}
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              {/* Attachment Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110">
                    <Paperclip className="h-5 w-5 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleFileUpload}>
                    <FileText className="h-4 w-4 mr-2" />
                    Upload file
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {/* Handle photo upload */}}>
                    <Image className="h-4 w-4 mr-2" />
                    Upload photo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {/* Handle camera */}}>
                    <Camera className="h-4 w-4 mr-2" />
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
                  "h-10 w-10 p-0 rounded-xl transition-all duration-300 hover:scale-110",
                  isRecording ? "text-red-500 bg-red-50 hover:bg-red-100 shadow-lg" : "hover:bg-gray-100 text-gray-600"
                )}
                onClick={toggleRecording}
              >
                {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              {/* Send Button */}
              <Button
                type="submit"
                size="sm"
                className="h-10 w-10 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                disabled={!message.trim() && attachedFiles.length === 0}
              >
                <Send className="h-5 w-5" />
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
        <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-2">
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
