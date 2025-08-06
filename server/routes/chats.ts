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
import fs from "fs";
import FormData from "form-data";
import axios from "axios";
import fetch1 from "node-fetch";

interface LocalApiResponse {
  message?: string;
  error?: string;
  answer?: string;
}

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
  // Allow PDF and CSV files for chat uploads
  if (file.mimetype === "application/pdf" || file.mimetype === "text/csv") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and CSV files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export const uploadPDF = upload.single("pdfFile");
export const uploadCSV = upload.single("csvFile");
export const uploadFile = upload.single("file"); // Generic file upload

// Function to extract text from PDF (basic implementation)
async function extractPDFText(filePath: string): Promise<string> {
  try {
    // For now, return a placeholder. In a real implementation, you'd use a library like pdf-parse
    return `[PDF Content] This is a placeholder for the PDF content from ${path.basename(filePath)}. In a production environment, this would contain the actual extracted text from the PDF.`;
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    return "[PDF Error] Could not extract text from the PDF file.";
  }
}

// Function to extract data from CSV (basic implementation)
async function extractCSVData(filePath: string): Promise<string> {
  try {
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    // For now, return the first few lines as a preview. In production, you'd parse the CSV properly
    const lines = csvContent.split('\n').slice(0, 10);
    return `[CSV Data] Preview of ${path.basename(filePath)}:\n${lines.join('\n')}\n\n[Note: This is a preview. Full CSV processing would be implemented in production.]`;
  } catch (error) {
    console.error("Error extracting CSV data:", error);
    return "[CSV Error] Could not extract data from the CSV file.";
  }
}

// Function to call Gemini API with PDF file
async function callGeminiAPI(
  userMessage: string,
  apiKey: string,
  model: string = "gemini-1.5-flash-latest",
  chatHistory: Message[] = [],
  pdfFilePath?: string,
): Promise<string> {
  try {
    // Format chat history for Gemini API
    const contents = [];

    // Add previous messages from chat history
    for (const message of chatHistory) {
      if (message.type === "user") {
        contents.push({
          role: "user",
          parts: [{ text: message.content }],
        });
      } else if (message.type === "assistant") {
        contents.push({
          role: "model",
          parts: [{ text: message.content }],
        });
      }
    }

    // Prepare parts for the current message
    const parts: any[] = [{ text: userMessage }];

    // Add PDF file if available
    if (pdfFilePath) {
      try {
        // Read PDF file as base64
        const pdfBuffer = fs.readFileSync(pdfFilePath);
        const base64Data = pdfBuffer.toString("base64");

        // Add PDF to the message parts
        parts.push({
          inline_data: {
            mime_type: "application/pdf",
            data: base64Data,
          },
        });
      } catch (fileError) {
        console.error("Error reading PDF file:", fileError);
        parts.push({ text: "\n[Note: PDF file could not be loaded]" });
      }
    }

    contents.push({
      role: "user",
      parts: parts,
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: contents,
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

// Function to call Local Cloud backend with PDF file
async function callLocalCloudAPI(
  userMessage: string,
  pdfFilePath?: string,
  appUrl?: string,
  isInitialPdfSetup: boolean = false,
): Promise<string> {
  const baseUrl =
    appUrl && appUrl.trim() ? appUrl.trim() : "http://127.0.0.1:5000";
  try {
    // Use appUrl from settings or fallback to default local URL

    if (pdfFilePath && isInitialPdfSetup) {
      // Initial PDF setup - send to /init-pdf with FormData
      const initPdfUrl = `${baseUrl.replace(/\/$/, "")}/init-pdf`;
      // const FormData = require("form-data");
      const formData = new FormData();
      // formData.append("message", userMessage);

      // Read the PDF file and attach it
      const pdfStream = fs.createReadStream(pdfFilePath);
      formData.append("pdf_file", pdfStream, path.basename(pdfFilePath));
      // formData.append("pdf_file", pdfFile);

      // const response = await fetch(initPdfUrl, {
      //   method: "POST",
      //   body: formData,
      // });
      const response = await fetch1(initPdfUrl, {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(), // includes correct Content-Type with boundary
      });

      // const errorText = await response.text();
      // console.error("Server response body:", errorText);

      if (!response.ok) {
        throw new Error(
          `Local Cloud API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as LocalApiResponse;
      return (
        data.message ||
        "I apologize, but I couldn't generate a response. Please try again."
      );
    } else {
      // Regular chat message - use /chat endpoint with JSON
      const chatUrl = `${baseUrl.replace(/\/$/, "")}/ask`;
      const response = await fetch(chatUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Local Cloud API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return (
        data.response ||
        "I apologize, but I couldn't generate a response. Please try again."
      );
    }
  } catch (error) {
    console.error("Local Cloud API error:", error);
    return `I'm currently unable to connect to the local AI service at ${baseUrl}. Please ensure your local backend is running. ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

// Function to call Local Cloud backend with CSV file
async function callCSVLocalCloudAPI(
  userMessage: string,
  csvFilePath?: string,
  appUrl?: string,
  isInitialCsvSetup: boolean = false,
): Promise<string> {
  const baseUrl =
    appUrl && appUrl.trim() ? appUrl.trim() : "http://127.0.0.1:5000";
  try {
    if (csvFilePath && isInitialCsvSetup) {
      // Initial CSV setup - send to /init-csv with FormData
      const initCsvUrl = `${baseUrl.replace(/\/$/, "")}/init-csv`;
      const formData = new FormData();

      // Read the CSV file and attach it
      const csvStream = fs.createReadStream(csvFilePath);
      formData.append("csv_file", csvStream, path.basename(csvFilePath));

      const response = await fetch1(initCsvUrl, {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(), // includes correct Content-Type with boundary
      });

      if (!response.ok) {
        throw new Error(
          `CSV Local Cloud API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as LocalApiResponse;
      return (
        data.message ||
        "I apologize, but I couldn't generate a response. Please try again."
      );
    } else {
      // Regular chat message - use /ask-csv endpoint with JSON
      const chatUrl = `${baseUrl.replace(/\/$/, "")}/ask-csv`;
      const response = await fetch(chatUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `CSV Local Cloud API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return (
        data.response ||
        "I apologize, but I couldn't generate a response. Please try again."
      );
    }
  } catch (error) {
    console.error("CSV Local Cloud API error:", error);
    return `I'm currently unable to connect to the local AI service at ${baseUrl}. Please ensure your local backend is running. ${error instanceof Error ? error.message : "Unknown error"}`;
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
        attachments: pdfFile ? [pdfFile] : undefined, // Include PDF as attachment
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
      // If no initial message but PDF is uploaded, create a user message showing the PDF upload
      const userMessage: Message = {
        id: uuidv4(),
        chatId: chatId,
        type: "user",
        content: `📄 Uploaded document for analysis`,
        timestamp: now,
        attachments: [pdfFile],
      };

      DataManager.addMessage(userMessage);

      // Process the PDF and generate AI response
      setTimeout(async () => {
        const pdfPath = path.join(
          process.cwd(),
          "server/uploads",
          path.basename(pdfFile.url),
        );
        const pdfContent = await extractPDFText(pdfPath);
        const analysisPrompt = `Tu es un assistant expert qui répond aux questions en se basant sur le pdf fourni.`;

        const aiMessage: Message = {
          id: uuidv4(),
          chatId: chatId,
          type: "assistant",
          content: await generateAIResponseWithPDF(
            analysisPrompt,
            userId,
            chatId,
            pdfContent,
            true, // This is the initial PDF setup
          ),
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
      let pdfContent: string | undefined;

      // If chat has PDF, extract its content
      if (chat.pdfFile) {
        const pdfPath = path.join(
          process.cwd(),
          "server/uploads",
          path.basename(chat.pdfFile.url),
        );
        pdfContent = await extractPDFText(pdfPath);
      }

      const aiMessage: Message = {
        id: uuidv4(),
        chatId: chatId,
        type: "assistant",
        content: await generateAIResponseWithPDF(
          message,
          chat.userId,
          chatId,
          pdfContent,
        ),
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

// AI response generator with PDF content support
async function generateAIResponseWithPDF(
  userMessage: string,
  userId: string = "user-1",
  chatId?: string,
  pdfContent?: string,
  isInitialPdfSetup: boolean = false,
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
      const geminiModel =
        user?.settings?.geminiModel || "gemini-1.5-flash-latest";

      if (!geminiApiKey || !geminiApiKey.trim()) {
        return "❌ **API Key Required**: To use the Cloud model, please add your Gemini API key in Settings. You can get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).";
      }

      try {
        // Get chat history for context (excluding the current message)
        let chatHistory = chatId ? DataManager.getMessagesByChatId(chatId) : [];

        // Remove the last message if it's a user message matching the current message
        if (chatHistory.length > 0) {
          const lastMessage = chatHistory[chatHistory.length - 1];
          if (
            lastMessage.type === "user" &&
            lastMessage.content === userMessage
          ) {
            chatHistory = chatHistory.slice(0, -1);
          }
        }

        // Get PDF file path instead of content
        let pdfFilePath: string | undefined;
        if (chatId) {
          const chat = DataManager.getChatById(chatId);
          if (chat?.pdfFile) {
            pdfFilePath = path.join(
              process.cwd(),
              "server/uploads",
              path.basename(chat.pdfFile.url),
            );
          }
        }

        return await callGeminiAPI(
          userMessage,
          geminiApiKey,
          geminiModel,
          chatHistory,
          pdfFilePath,
        );
      } catch (error) {
        console.error("Gemini API error:", error);
        return `❌ **API Error**: Failed to connect to Gemini API. Please check your API key or try again later. Error: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    } else if (modelType === "local-cloud") {
      // Use Local Cloud backend
      try {
        // Get PDF file path and app URL
        let pdfFilePath: string | undefined;
        if (chatId) {
          const chat = DataManager.getChatById(chatId);
          if (chat?.pdfFile) {
            pdfFilePath = path.join(
              process.cwd(),
              "server/uploads",
              path.basename(chat.pdfFile.url),
            );
          }
        }

        const appUrl = user?.settings?.appUrl;
        return await callLocalCloudAPI(
          userMessage,
          pdfFilePath,
          appUrl,
          isInitialPdfSetup,
        );
      } catch (error) {
        console.error("Local Cloud API error:", error);
        return `❌ **Local Service Error**: Failed to connect to local AI service. Please ensure your local backend is running and the App URL is correctly configured in settings. Error: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    }
  } catch (error) {
    console.error("Error accessing AI services:", error);
    return `❌ **System Error**: An unexpected error occurred while processing your request. Please try again later. Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }

  return "❌ **Configuration Error**: Unable to determine the appropriate AI service. Please check your settings.";
}

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
      const geminiModel =
        user?.settings?.geminiModel || "gemini-1.5-flash-latest";

      if (!geminiApiKey || !geminiApiKey.trim()) {
        return "❌ **API Key Required**: To use the Cloud model, please add your Gemini API key in Settings. You can get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).";
      }

      try {
        // Get chat history for context (excluding the current message)
        let chatHistory = chatId ? DataManager.getMessagesByChatId(chatId) : [];

        // Remove the last message if it's a user message matching the current message
        // This prevents sending the same message twice to Gemini
        if (chatHistory.length > 0) {
          const lastMessage = chatHistory[chatHistory.length - 1];
          if (
            lastMessage.type === "user" &&
            lastMessage.content === userMessage
          ) {
            chatHistory = chatHistory.slice(0, -1);
          }
        }

        return await callGeminiAPI(
          userMessage,
          geminiApiKey,
          geminiModel,
          chatHistory,
        );
      } catch (error) {
        console.error("Gemini API error:", error);
        return `❌ **API Error**: Failed to connect to Gemini API. Please check your API key or try again later. Error: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    } else if (modelType === "local-cloud") {
      // Use Local Cloud backend
      try {
        const chat = chatId ? DataManager.getChatById(chatId) : null;
        const pdfContext = chat?.pdfFile?.name;
        const appUrl = user.settings.appUrl;
        return await callLocalCloudAPI(userMessage, pdfContext);
      } catch (error) {
        console.error("Local Cloud API error:", error);
        return `❌ **Local Service Error**: Failed to connect to local AI service. Please ensure your local backend is running at http://localhost:3001/api/chat. Error: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    }
  } catch (error) {
    console.error("Error accessing AI services:", error);
    return `❌ **System Error**: An unexpected error occurred while processing your request. Please try again later. Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }

  return "❌ **Configuration Error**: Unable to determine the appropriate AI service. Please check your settings.";
}
