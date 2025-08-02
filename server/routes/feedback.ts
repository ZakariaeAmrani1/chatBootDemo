import { RequestHandler } from "express";
import { MessageFeedbackRequest, ApiResponse } from "@shared/types";
import { dataManager } from "../utils/dataManager";

export const handleMessageFeedback: RequestHandler = async (req, res) => {
  try {
    const { messageId, action }: MessageFeedbackRequest = req.body;

    if (!messageId || !action) {
      return res.status(400).json({
        success: false,
        error: "Message ID and action are required",
      } as ApiResponse<null>);
    }

    // Get current chats data
    const chatsData = await dataManager.getChats();

    // Find the message
    const messageIndex = chatsData.messages.findIndex(
      (msg) => msg.id === messageId,
    );

    if (messageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      } as ApiResponse<null>);
    }

    const message = chatsData.messages[messageIndex];

    // Update message based on action
    switch (action) {
      case "like":
        message.liked = true;
        message.disliked = false; // Remove dislike if present
        break;
      case "dislike":
        message.disliked = true;
        message.liked = false; // Remove like if present
        break;
      case "removelike":
        message.liked = false;
        break;
      case "removedislike":
        message.disliked = false;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: "Invalid action",
        } as ApiResponse<null>);
    }

    // Update the message in the array
    chatsData.messages[messageIndex] = message;

    // Save updated data
    await dataManager.saveChats(chatsData);

    res.json({
      success: true,
      data: {
        messageId,
        liked: message.liked || false,
        disliked: message.disliked || false,
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
