import { RequestHandler } from "express";
import * as fs from "fs";
import * as path from "path";
import { ApiResponse } from "@shared/types";

interface ModelOption {
  id: string;
  name: string;
  description: string;
  features: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  badge?: string;
  price?: string;
  enabled: boolean;
  order: number;
}

interface ModelsData {
  models: ModelOption[];
}

// Get all available models
export const getModels: RequestHandler = (req, res) => {
  try {
    const dataPath = path.join(__dirname, "..", "data", "models.json");
    const fileContent = fs.readFileSync(dataPath, "utf8");
    const modelsData: ModelsData = JSON.parse(fileContent);

    // Filter enabled models and sort by order
    const availableModels = modelsData.models
      .filter((model) => model.enabled)
      .sort((a, b) => a.order - b.order);

    const response: ApiResponse<ModelOption[]> = {
      success: true,
      data: availableModels,
    };

    res.json(response);
  } catch (error) {
    console.error("Error reading models data:", error);
    const response: ApiResponse<ModelOption[]> = {
      success: false,
      error: "Failed to load models",
    };
    res.status(500).json(response);
  }
};

// Add a new model (optional for future use)
export const addModel: RequestHandler = (req, res) => {
  try {
    const newModel: Omit<ModelOption, "order"> = req.body;

    const dataPath = path.join(__dirname, "..", "data", "models.json");
    const fileContent = fs.readFileSync(dataPath, "utf8");
    const modelsData: ModelsData = JSON.parse(fileContent);

    // Calculate next order number
    const maxOrder = Math.max(...modelsData.models.map((m) => m.order), 0);
    const modelToAdd: ModelOption = {
      ...newModel,
      order: maxOrder + 1,
    };

    modelsData.models.push(modelToAdd);

    // Write back to file
    fs.writeFileSync(dataPath, JSON.stringify(modelsData, null, 2));

    const response: ApiResponse<ModelOption> = {
      success: true,
      data: modelToAdd,
    };

    res.json(response);
  } catch (error) {
    console.error("Error adding model:", error);
    const response: ApiResponse<ModelOption> = {
      success: false,
      error: "Failed to add model",
    };
    res.status(500).json(response);
  }
};
