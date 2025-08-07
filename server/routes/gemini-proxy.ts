import { RequestHandler } from "express";
import fetch from "node-fetch";
import { ApiResponse } from "@shared/types";

// Proxy endpoint for Gemini API to avoid CORS issues
export const geminiProxy: RequestHandler = async (req, res) => {
  try {
    const { apiKey, model, contents, generationConfig } = req.body;

    console.log("🤖 Gemini proxy request:", {
      model,
      contentsLength: contents?.length,
      hasApiKey: !!apiKey,
    });

    if (!apiKey || !model || !contents) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: apiKey, model, or contents",
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: contents,
          generationConfig: generationConfig || {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          },
        }),
      },
    );

    clearTimeout(timeoutId);

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", parseError);
      return res.status(500).json({
        success: false,
        error: "Invalid JSON response from Gemini API",
      });
    }

    if (!response.ok) {
      console.error(`Gemini API error ${response.status}:`, data);
      return res.status(response.status).json({
        success: false,
        error: `Gemini API error: ${response.status} ${response.statusText}`,
      });
    }

    const apiResponse: ApiResponse<any> = {
      success: true,
      data: data,
    };

    res.json(apiResponse);
  } catch (error) {
    console.error("Gemini proxy error:", error);

    if (error.name === "AbortError") {
      return res.status(408).json({
        success: false,
        error: "Request timeout",
      });
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Gemini proxy error",
    });
  }
};
