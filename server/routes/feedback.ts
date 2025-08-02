import { RequestHandler } from "express";
import { MessageFeedbackRequest, ApiResponse } from "@shared/types";
import { DataManager } from "../utils/dataManager";

export const handleMessageFeedback: RequestHandler = async (req, res) => {
  try {
    const { messageId, action }: MessageFeedbackRequest = req.body;

    if (!messageId || !action) {
      return res.status(400).json({
        success: false,
        error: "Message ID and action are required",
      } as ApiResponse<null>);
    }

    // Prepare updates based on action
    let updates: Partial<any> = {};

    switch (action) {
      case "like":
        updates = { liked: true, disliked: false };
        break;
      case "dislike":
        updates = { disliked: true, liked: false };
        break;
      case "removelike":
        updates = { liked: false };
        break;
      case "removedislike":
        updates = { disliked: false };
        break;
      default:
        return res.status(400).json({
          success: false,
          error: "Invalid action",
        } as ApiResponse<null>);
    }

    // Update the message
    const updatedMessage = DataManager.updateMessage(messageId, updates);

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      } as ApiResponse<null>);
    }

    res.json({
      success: true,
      data: {
        messageId,
        liked: updatedMessage.liked || false,
        disliked: updatedMessage.disliked || false,
      },
    } as ApiResponse<{
      messageId: string;
      liked: boolean;
      disliked: boolean;
    }>);
  } catch (error) {
    console.error("Error updating message feedback:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update message feedback",
    } as ApiResponse<null>);
  }
};
