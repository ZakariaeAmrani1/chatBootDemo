import { RequestHandler } from "express";
import { DataManager } from "../utils/dataManager";
import { Chat, Message, CreateChatRequest, SendMessageRequest, ApiResponse } from "@shared/types";
import { v4 as uuidv4 } from 'uuid';

// Get all chats for a user
export const getChats: RequestHandler = (req, res) => {
  try {
    const userId = req.query.userId as string || 'user-1'; // Default to demo user
    const chats = DataManager.getChatsByUserId(userId);
    
    const response: ApiResponse<Chat[]> = {
      success: true,
      data: chats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    };
    
    res.json(response);
  } catch (error) {
    const response: ApiResponse<Chat[]> = {
      success: false,
      error: 'Failed to fetch chats'
    };
    res.status(500).json(response);
  }
};

// Get messages for a specific chat
export const getChatMessages: RequestHandler = (req, res) => {
  try {
    const chatId = req.params.chatId;
    const messages = DataManager.getMessagesByChatId(chatId);
    
    const response: ApiResponse<Message[]> = {
      success: true,
      data: messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    };
    
    res.json(response);
  } catch (error) {
    const response: ApiResponse<Message[]> = {
      success: false,
      error: 'Failed to fetch messages'
    };
    res.status(500).json(response);
  }
};

// Create a new chat
export const createChat: RequestHandler = (req, res) => {
  try {
    const { title, model, message } = req.body as CreateChatRequest;
    const userId = req.body.userId || 'user-1'; // Default to demo user
    
    const chatId = uuidv4();
    const now = new Date().toISOString();
    
    // Create the chat
    const chat: Chat = {
      id: chatId,
      title: title || 'New Chat',
      model: model,
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
      userId: userId
    };
    
    const createdChat = DataManager.createChat(chat);
    
    // Add the initial user message
    const userMessage: Message = {
      id: uuidv4(),
      chatId: chatId,
      type: 'user',
      content: message,
      timestamp: now
    };
    
    DataManager.addMessage(userMessage);
    
    // Simulate AI thinking and response
    setTimeout(() => {
      const aiMessage: Message = {
        id: uuidv4(),
        chatId: chatId,
        type: 'assistant',
        content: generateAIResponse(message),
        timestamp: new Date().toISOString()
      };
      
      DataManager.addMessage(aiMessage);
    }, 2000); // 2 second delay to simulate thinking
    
    const response: ApiResponse<Chat> = {
      success: true,
      data: createdChat
    };
    
    res.json(response);
  } catch (error) {
    const response: ApiResponse<Chat> = {
      success: false,
      error: 'Failed to create chat'
    };
    res.status(500).json(response);
  }
};

// Send a message to an existing chat
export const sendMessage: RequestHandler = (req, res) => {
  try {
    const { chatId, message } = req.body as SendMessageRequest;
    const now = new Date().toISOString();
    
    // Check if chat exists
    const chat = DataManager.getChatById(chatId);
    if (!chat) {
      const response: ApiResponse<Message> = {
        success: false,
        error: 'Chat not found'
      };
      return res.status(404).json(response);
    }
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      chatId: chatId,
      type: 'user',
      content: message,
      timestamp: now
    };
    
    const addedMessage = DataManager.addMessage(userMessage);
    
    // Update chat title if it's still "New Chat" and this is the first real message
    if (chat.title === 'New Chat') {
      const truncatedTitle = message.length > 50 ? message.substring(0, 50) + '...' : message;
      DataManager.updateChat(chatId, { title: truncatedTitle });
    }
    
    // Simulate AI thinking and response
    setTimeout(() => {
      const aiMessage: Message = {
        id: uuidv4(),
        chatId: chatId,
        type: 'assistant',
        content: generateAIResponse(message),
        timestamp: new Date().toISOString()
      };
      
      DataManager.addMessage(aiMessage);
    }, 1500); // 1.5 second delay to simulate thinking
    
    const response: ApiResponse<Message> = {
      success: true,
      data: addedMessage
    };
    
    res.json(response);
  } catch (error) {
    const response: ApiResponse<Message> = {
      success: false,
      error: 'Failed to send message'
    };
    res.status(500).json(response);
  }
};

// Delete a chat
export const deleteChat: RequestHandler = (req, res) => {
  try {
    const chatId = req.params.chatId;
    const success = DataManager.deleteChat(chatId);
    
    if (!success) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Chat not found'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<null> = {
      success: true
    };
    
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to delete chat'
    };
    res.status(500).json(response);
  }
};

// Simple AI response generator for simulation
function generateAIResponse(userMessage: string): string {
  const responses = [
    "I understand what you're asking. Let me help you with that.",
    "That's an interesting question! Here's what I think...",
    "Based on your message, I can provide some insights.",
    "Let me break this down for you step by step.",
    "I'm here to help! Here's my response to your query.",
    "Thank you for your message. I'll do my best to assist you.",
    "That's a great point. Let me elaborate on that topic.",
    "I see what you mean. Here's my perspective on this matter."
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // Add some context based on the user message
  if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
    return "Hello! It's great to meet you. How can I assist you today?";
  }
  
  if (userMessage.toLowerCase().includes('help')) {
    return "I'm here to help! Please let me know what specific assistance you need, and I'll do my best to provide you with useful information.";
  }
  
  if (userMessage.toLowerCase().includes('code') || userMessage.toLowerCase().includes('programming')) {
    return "I'd be happy to help with coding! Whether you need help with debugging, learning new concepts, or writing code, I'm here to assist. What programming topic would you like to explore?";
  }
  
  return `${randomResponse} Your message about "${userMessage.substring(0, 30)}${userMessage.length > 30 ? '...' : ''}" is noted. This is a simulated response - soon this will be connected to a real AI API like Grok!`;
}
