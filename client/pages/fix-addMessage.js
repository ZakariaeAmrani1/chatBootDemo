// Quick fix script to test new addMessage function logic
const addMessage = async (
  content,
  attachments,
  chatState,
  chatService,
  selectedModel,
) => {
  if (!content.trim() && (!attachments || attachments.length === 0)) return;

  try {
    // Handle creating new chat when no current chat exists
    if (!chatState.currentChat) {
      // Create new chat with message + attachments
      const newChat = await chatService.createChat({
        title: content.length > 30 ? content.substring(0, 30) + "..." : content,
        model: selectedModel,
        chatbootVersion: "ChatNova V3",
        message: content,
        attachments,
      });

      if (newChat && attachments && attachments.length > 0) {
        // Now send the message with attachments to the new chat
        await chatService.sendMessage({
          chatId: newChat.id,
          content: content,
          attachments: attachments,
        });
      }
    } else {
      // Send message to existing chat
      await chatService.sendMessage({
        chatId: chatState.currentChat.id,
        content: content,
        attachments: attachments,
      });
    }
  } catch (error) {
    console.error("Failed to send message:", error);
  }
};

console.log("New addMessage function ready!");
