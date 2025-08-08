import { StorageManager } from "./storageManager";

export class ClientGeminiService {
  static async generateContentWithFile(
    file: File,
    prompt: string,
    model: string = "gemini-2.5-flash",
    apiKey?: string,
  ): Promise<{ content: string; error?: string }> {
    try {
      // Get API key from user settings or parameter
      const currentUser = StorageManager.getCurrentUser();
      const geminiApiKey = apiKey || currentUser?.settings?.geminiApiKey;

      if (!geminiApiKey) {
        return {
          content: "",
          error: "Gemini API key not configured. Please add your API key in settings.",
        };
      }

      // Convert file to base64 for upload
      const fileBuffer = await file.arrayBuffer();
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
              {
                inline_data: {
                  mime_type: file.type,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          content: "",
          error: `Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`,
        };
      }

      const data = await response.json();

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const content = data.candidates[0].content.parts[0].text;
        return {
          content: content || "No response generated.",
        };
      } else {
        return {
          content: "",
          error: "No valid response from Gemini API",
        };
      }
    } catch (error) {
      console.error("Gemini API file upload error:", error);
      return {
        content: "",
        error: error instanceof Error ? error.message : "Failed to generate content with file",
      };
    }
  }

  static async generateContent(
    prompt: string,
    model: string = "gemini-1.5-flash-latest",
    apiKey?: string,
  ): Promise<{ content: string; error?: string }> {
    try {
      // Get API key from user settings or parameter
      const currentUser = StorageManager.getCurrentUser();
      const geminiApiKey = apiKey || currentUser?.settings?.geminiApiKey;

      if (!geminiApiKey) {
        return {
          content: "",
          error:
            "Gemini API key not configured. Please add your API key in settings.",
        };
      }

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          content: "",
          error: `Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`,
        };
      }

      const data = await response.json();

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const content = data.candidates[0].content.parts[0].text;
        return {
          content: content || "No response generated.",
        };
      } else {
        return {
          content: "",
          error: "No valid response from Gemini API",
        };
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      return {
        content: "",
        error:
          error instanceof Error ? error.message : "Failed to generate content",
      };
    }
  }

  static async analyzeDocument(
    documentText: string,
    prompt: string = "Please analyze this document and provide a summary.",
    model: string = "gemini-1.5-flash-latest",
  ): Promise<{ content: string; error?: string }> {
    const fullPrompt = `${prompt}\n\nDocument content:\n${documentText}`;
    return this.generateContent(fullPrompt, model);
  }

  static async translateText(
    text: string,
    targetLanguage: string = "English",
    model: string = "gemini-1.5-flash-latest",
  ): Promise<{ content: string; error?: string }> {
    const prompt = `Please translate the following text to ${targetLanguage}:\n\n${text}`;
    return this.generateContent(prompt, model);
  }

  static async summarizeText(
    text: string,
    maxLength: string = "concise",
    model: string = "gemini-1.5-flash-latest",
  ): Promise<{ content: string; error?: string }> {
    const prompt = `Please provide a ${maxLength} summary of the following text:\n\n${text}`;
    return this.generateContent(prompt, model);
  }

  static async extractKeyPoints(
    text: string,
    model: string = "gemini-1.5-flash-latest",
  ): Promise<{ content: string; error?: string }> {
    const prompt = `Please extract the key points from the following text in bullet form:\n\n${text}`;
    return this.generateContent(prompt, model);
  }

  static validateApiKey(apiKey: string): boolean {
    // Basic validation - Gemini API keys typically start with 'AIza'
    return apiKey.length > 20 && apiKey.startsWith("AIza");
  }

  static getAvailableModels(): string[] {
    return [
      "gemini-2.5-flash",
      "gemini-2.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro",
      "gemini-1.5-pro-latest",
      "gemini-pro",
      "gemini-pro-vision",
    ];
  }
}
