import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Copy, ThumbsUp, ThumbsDown, RotateCcw, Share } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/pages/Chatbot';

interface ChatAreaProps {
  messages: Message[];
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gray-600">
            <path
              d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
          How can I help you today?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
          <div className="group p-6 bg-white border border-gray-200 rounded-2xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">Create image</h4>
            <p className="text-sm text-gray-600 group-hover:text-gray-700">Generate creative and custom images with DALL·E</p>
          </div>
          <div className="group p-6 bg-white border border-gray-200 rounded-2xl hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-200 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">Analyze data</h4>
            <p className="text-sm text-gray-600 group-hover:text-gray-700">Upload and analyze documents, spreadsheets, and more</p>
          </div>
          <div className="group p-6 bg-white border border-gray-200 rounded-2xl hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-200 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">Summarize text</h4>
            <p className="text-sm text-gray-600 group-hover:text-gray-700">Extract key points from long documents and articles</p>
          </div>
          <div className="group p-6 bg-white border border-gray-200 rounded-2xl hover:bg-gradient-to-br hover:from-violet-50 hover:to-purple-50 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10 hover:border-violet-200 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-violet-700 transition-colors">Write code</h4>
            <p className="text-sm text-gray-600 group-hover:text-gray-700">Debug and create code in various programming languages</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
      <div className="max-w-4xl mx-auto py-6 space-y-6">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-4",
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.sender === 'assistant' && (
              <Avatar className="w-8 h-8 mt-1 bg-green-600">
                <AvatarFallback className="bg-green-600 text-white text-sm font-semibold">
                  AI
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className={cn(
              "flex-1 max-w-3xl",
              message.sender === 'user' ? 'ml-12' : 'mr-12'
            )}>
              <div className={cn(
                "rounded-2xl px-6 py-4",
                message.sender === 'user'
                  ? 'bg-gray-100 ml-auto max-w-lg'
                  : 'bg-transparent'
              )}>
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              </div>
              
              {message.sender === 'assistant' && (
                <div className="flex items-center gap-2 mt-3">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            {message.sender === 'user' && (
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
                  U
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatArea;
