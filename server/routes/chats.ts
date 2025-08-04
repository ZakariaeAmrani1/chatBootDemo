import { RequestHandler } from "express";
import { DataManager } from "../utils/dataManager";
import {
  Chat,
  Message,
  CreateChatRequest,
  SendMessageRequest,
  ApiResponse,
  FileAttachment,
} from "@shared/types";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import path from "path";

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "server/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueId}${extension}`);
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  // Only allow PDF files for chat uploads
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export const uploadPDF = upload.single("pdfFile");

// Function to call Gemini API
async function callGeminiAPI(
  userMessage: string,
  apiKey: string,
  model: string = "gemini-1.5-flash-latest",
): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: userMessage,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1000,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologize, but I couldn't generate a response. Please try again."
    );
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I'm currently unable to connect to the AI service. Please check your API key or try again later.";
  }
}

// Function to call Local Cloud backend (commented for now)
async function callLocalCloudAPI(
  userMessage: string,
  pdfContext?: string,
): Promise<string> {
  try {
    // TODO: Uncomment and configure when local backend is ready
    /*
    const response = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        pdfContext: pdfContext,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Local Cloud API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.response || "I apologize, but I couldn't generate a response. Please try again.";
    */

    // Fallback response for now
    return `[Local Cloud Response] I've analyzed your message: "${userMessage}". This is a simulated response from the local cloud model. The actual implementation will connect to your local backend.`;
  } catch (error) {
    console.error("Local Cloud API error:", error);
    return "I'm currently unable to connect to the local AI service. Please ensure your local backend is running.";
  }
}

// Get all chats for a user
export const getChats: RequestHandler = (req, res) => {
  try {
    const userId = (req.query.userId as string) || "user-1"; // Default to demo user
    const chats = DataManager.getChatsByUserId(userId);

    const response: ApiResponse<Chat[]> = {
      success: true,
      data: chats.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<Chat[]> = {
      success: false,
      error: "Failed to fetch chats",
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
      data: messages.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      ),
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<Message[]> = {
      success: false,
      error: "Failed to fetch messages",
    };
    res.status(500).json(response);
  }
};

// Create a new chat
export const createChat: RequestHandler = (req, res) => {
  try {
    const { title, model, chatbootVersion, message } =
      req.body as CreateChatRequest;
    const userId = req.body.userId || "user-1"; // Default to demo user

    const chatId = uuidv4();
    const now = new Date().toISOString();

    // Handle PDF file if uploaded
    let pdfFile: FileAttachment | undefined;
    if (req.file) {
      pdfFile = {
        id: uuidv4(),
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        url: `/api/files/${req.file.filename}`,
        uploadedAt: now,
      };

      // Store file info in the data manager
      DataManager.addFile(pdfFile);
    }

    // Create the chat
    const chat: Chat = {
      id: chatId,
      title: title || "New Chat",
      model: model,
      chatbootVersion: chatbootVersion || "ChatNova V3", // Default to V3
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
      userId: userId,
      pdfFile: pdfFile, // Include the PDF file
    };

    const createdChat = DataManager.createChat(chat);

    // Add the initial user message if provided
    if (message && message.trim()) {
      const userMessage: Message = {
        id: uuidv4(),
        chatId: chatId,
        type: "user",
        content: message,
        timestamp: now,
      };

      DataManager.addMessage(userMessage);

      // Generate AI response
      setTimeout(async () => {
        const aiMessage: Message = {
          id: uuidv4(),
          chatId: chatId,
          type: "assistant",
          content: await generateAIResponse(message, userId, chatId),
          timestamp: new Date().toISOString(),
        };

        DataManager.addMessage(aiMessage);
      }, 2000); // 2 second delay to simulate thinking
    } else if (pdfFile) {
      // If no initial message but PDF is uploaded, create a welcome message
      setTimeout(async () => {
        const aiMessage: Message = {
          id: uuidv4(),
          chatId: chatId,
          type: "assistant",
          content: `Hello! I've successfully received your PDF document "${pdfFile.name}". I'm ready to help you analyze and answer questions about this document. What would you like to know?`,
          timestamp: new Date().toISOString(),
        };

        DataManager.addMessage(aiMessage);
      }, 1500);
    }

    const response: ApiResponse<Chat> = {
      success: true,
      data: createdChat,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<Chat> = {
      success: false,
      error: "Failed to create chat",
    };
    res.status(500).json(response);
  }
};

// Send a message to an existing chat
export const sendMessage: RequestHandler = (req, res) => {
  try {
    const { chatId, message, attachments } = req.body as SendMessageRequest;
    const now = new Date().toISOString();

    // Check if chat exists
    const chat = DataManager.getChatById(chatId);
    if (!chat) {
      const response: ApiResponse<Message> = {
        success: false,
        error: "Chat not found",
      };
      return res.status(404).json(response);
    }

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      chatId: chatId,
      type: "user",
      content: message,
      timestamp: now,
      attachments: attachments,
    };

    const addedMessage = DataManager.addMessage(userMessage);

    // Update chat title if it's still "New Chat" and this is the first real message
    if (chat.title === "New Chat") {
      const truncatedTitle =
        message.length > 50 ? message.substring(0, 50) + "..." : message;
      DataManager.updateChat(chatId, { title: truncatedTitle });
    }

    // Generate AI response
    setTimeout(async () => {
      let aiResponseMessage = message;

      // If chat has PDF, mention it in the context
      if (chat.pdfFile) {
        aiResponseMessage = `Based on the uploaded PDF "${chat.pdfFile.name}" and your question: "${message}"`;
      }

      const aiMessage: Message = {
        id: uuidv4(),
        chatId: chatId,
        type: "assistant",
        content: await generateAIResponse(aiResponseMessage, chat.userId, chatId),
        timestamp: new Date().toISOString(),
      };

      DataManager.addMessage(aiMessage);
    }, 1500); // 1.5 second delay to simulate thinking

    const response: ApiResponse<Message> = {
      success: true,
      data: addedMessage,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<Message> = {
      success: false,
      error: "Failed to send message",
    };
    res.status(500).json(response);
  }
};

// Update a chat
export const updateChat: RequestHandler = (req, res) => {
  try {
    const chatId = req.params.chatId;
    const updates = req.body;

    const updatedChat = DataManager.updateChat(chatId, updates);

    if (!updatedChat) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Chat not found",
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<Chat> = {
      success: true,
      data: updatedChat,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to update chat",
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
        error: "Chat not found",
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<null> = {
      success: true,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to delete chat",
    };
    res.status(500).json(response);
  }
};

// AI response generator with Gemini API and Local Cloud integration
async function generateAIResponse(
  userMessage: string,
  userId: string = "user-1",
  chatId?: string,
): Promise<string> {
  try {
    const user = DataManager.getUserById(userId);

    // Get the chat to determine which model to use
    let modelType = "cloud"; // default
    if (chatId) {
      const chat = DataManager.getChatById(chatId);
      modelType = chat?.model || "cloud";
    }

    if (modelType === "cloud") {
      // Use Gemini API for Cloud model
      const geminiApiKey = user?.settings?.geminiApiKey;
      const geminiModel = user?.settings?.geminiModel || "gemini-1.5-flash-latest";
      if (geminiApiKey && geminiApiKey.trim()) {
        return await callGeminiAPI(userMessage, geminiApiKey, geminiModel);
      }
    } else if (modelType === "local-cloud") {
      // Use Local Cloud backend
      const chat = chatId ? DataManager.getChatById(chatId) : null;
      const pdfContext = chat?.pdfFile?.name;
      return await callLocalCloudAPI(userMessage, pdfContext);
    }
  } catch (error) {
    console.error("Error accessing AI services:", error);
  }

  // Fallback to simulated responses
  const responses = [
    "I understand what you're asking. Let me help you with that.",
    "That's an interesting question! Here's what I think...",
    "Based on your message, I can provide some insights.",
    "Let me break this down for you step by step.",
    "I'm here to help! Here's my response to your query.",
    "Thank you for your message. I'll do my best to assist you.",
    "That's a great point. Let me elaborate on that topic.",
    "I see what you mean. Here's my perspective on this matter.",
  ];

  const randomResponse =
    responses[Math.floor(Math.random() * responses.length)];

  // Add some context based on the user message
  if (
    userMessage.toLowerCase().includes("hello") ||
    userMessage.toLowerCase().includes("hi")
  ) {
    return "Hello! It's great to meet you. How can I assist you today?";
  }

  if (userMessage.toLowerCase().includes("help")) {
    return "I'm here to help! Please let me know what specific assistance you need, and I'll do my best to provide you with useful information.";
  }

  if (
    userMessage.toLowerCase().includes("code") ||
    userMessage.toLowerCase().includes("programming")
  ) {
    return "I'd be happy to help with coding! Whether you need help with debugging, learning new concepts, or writing code, I'm here to assist. What programming topic would you like to explore?";
  }

  return `${randomResponse} Your message about "${userMessage.substring(0, 30)}${userMessage.length > 30 ? "..." : ""}" is noted. This is a simulated response - soon this will be connected to a real AI API like Grok!`;
}
