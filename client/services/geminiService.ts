import { Message } from "../../shared/types";

interface GeminiAPIResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
}

export class GeminiService {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-1.5-flash-latest") {
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Processes a PDF file and prompt with Gemini API
   */
  async processPDFWithPrompt(
    pdfFile: File,
    prompt: string,
    chatHistory: Message[] = []
  ): Promise<string> {
    try {
      // Convert PDF to base64
      const base64Data = await this.fileToBase64(pdfFile);

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
      const parts: any[] = [{ text: prompt }];

      // Add PDF to the message parts
      parts.push({
        inline_data: {
          mime_type: "application/pdf",
          data: base64Data,
        },
      });

      contents.push({
        role: "user",
        parts: parts,
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: contents,
            generationConfig: {
              temperature: 0.7,
              topK: 1,
              topP: 1,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error ${response.status}:`, errorText);
        throw new Error(
          `Gemini API error: ${response.status} ${response.statusText}`
        );
      }

      const data: GeminiAPIResponse = await response.json();
      console.log("Gemini API full response:", JSON.stringify(data, null, 2));

      // Check if we have a valid response structure
      if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        if (
          candidate.content &&
          candidate.content.parts &&
          candidate.content.parts.length > 0
        ) {
          const responseText = candidate.content.parts[0].text;
          if (responseText && responseText.trim()) {
            return responseText;
          }
        }

        // Check for safety filtering or other issues
        if (candidate.finishReason) {
          console.log("Gemini finish reason:", candidate.finishReason);
          if (candidate.finishReason === "SAFETY") {
            return "I apologize, but I cannot provide a response to this request due to safety guidelines. Please try rephrasing your question.";
          }
          if (candidate.finishReason === "RECITATION") {
            return "I apologize, but I cannot provide a response due to content policy restrictions. Please try rephrasing your question.";
          }
        }
      }

      // Log the issue for debugging
      console.error("Gemini API returned unexpected response structure:", data);
      return "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error("Gemini API error:", error);
      if (error.name === "AbortError") {
        return "The request timed out. Please try again with a smaller file or simpler question.";
      }
      return "I'm currently unable to connect to the AI service. Please check your API key or try again later.";
    }
  }

  /**
   * Sends a regular text message to Gemini API
   */
  async sendMessage(
    message: string,
    chatHistory: Message[] = []
  ): Promise<string> {
    try {
      // Format chat history for Gemini API
      const contents = [];

      // Add previous messages from chat history
      for (const historyMessage of chatHistory) {
        if (historyMessage.type === "user") {
          contents.push({
            role: "user",
            parts: [{ text: historyMessage.content }],
          });
        } else if (historyMessage.type === "assistant") {
          contents.push({
            role: "model",
            parts: [{ text: historyMessage.content }],
          });
        }
      }

      // Add current message
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: contents,
            generationConfig: {
              temperature: 0.7,
              topK: 1,
              topP: 1,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error ${response.status}:`, errorText);
        throw new Error(
          `Gemini API error: ${response.status} ${response.statusText}`
        );
      }

      const data: GeminiAPIResponse = await response.json();

      // Check if we have a valid response structure
      if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        if (
          candidate.content &&
          candidate.content.parts &&
          candidate.content.parts.length > 0
        ) {
          const responseText = candidate.content.parts[0].text;
          if (responseText && responseText.trim()) {
            return responseText;
          }
        }

        // Check for safety filtering or other issues
        if (candidate.finishReason) {
          console.log("Gemini finish reason:", candidate.finishReason);
          if (candidate.finishReason === "SAFETY") {
            return "I apologize, but I cannot provide a response to this request due to safety guidelines. Please try rephrasing your question.";
          }
          if (candidate.finishReason === "RECITATION") {
            return "I apologize, but I cannot provide a response due to content policy restrictions. Please try rephrasing your question.";
          }
        }
      }

      return "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error("Gemini API error:", error);
      if (error.name === "AbortError") {
        return "The request timed out. Please try again.";
      }
      return "I'm currently unable to connect to the AI service. Please check your API key or try again later.";
    }
  }

  /**
   * Converts a file to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsDataURL(file);
    });
  }
}
