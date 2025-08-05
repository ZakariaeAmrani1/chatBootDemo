# Chat API Response & Model Selection Fixes

## Issues Fixed

### 1. API Response Handling Issue

**Problem**: Messages would disappear after waiting animation, requiring page refresh to see responses.
**Root Cause**: Polling mechanism in `chatService.ts` had a bug where `pollCount` was never incremented.
**Solution**: Fixed polling logic to properly wait for API responses.

### 2. Draft Chat 404 Errors

**Problem**: 404 errors when changing models on initial chat page.
**Root Cause**: Trying to update draft chats on server when they only exist locally.
**Solution**: Skip server updates for draft chats in `handleModelChange`.

### 3. No Default Model Selection

**Problem**: Users had to manually select a model every time.
**Solution**: Auto-select first available model in `ModelSelectorCards.tsx`.

### 4. Category Chat Creation Error

**Problem**: Category-based chat creation used hardcoded "gemini-pro" model causing config errors.
**Solution**: Pass selected model from main chat to sidebar components.

## Files Modified

### 1. `client/services/chatService.ts`

- **COMPLETE REWRITE** of `startPollingForMessages` function
- Fixed counter increment bug
- Extended polling from 20 polls (10s) to 60 polls (30s)
- Improved error handling and message comparison
- Better cleanup of polling state

### 2. `client/pages/Chatbot.tsx`

- Added check for `isDraft` in `handleModelChange` to skip server updates for draft chats
- Added `selectedModel` prop to `ChatSidebar` component

### 3. `client/components/ModelSelectorCards.tsx`

- Added auto-selection of first model when none is selected
- Triggers in `useEffect` when models are loaded

### 4. `client/components/ChatSidebar.tsx`

- Added `selectedModel?: string` prop to interface
- Updated component parameters to accept `selectedModel`
- Changed `handleNewChatInCategory` to use `selectedModel || "cloud"` instead of hardcoded "gemini-pro"

## Key Code Changes

### chatService.ts - Fixed Polling

```typescript
// BEFORE (broken)
const pollCount = 0; // Never incremented!
const poll = async (count: number) => {
  if (count >= maxPolls) return;
  // ... polling logic
  setTimeout(() => poll(count + 1), 500); // count still 0
};

// AFTER (fixed)
let pollCount = 0;
let isPolling = true;
const poll = async () => {
  if (!isPolling || pollCount >= maxPolls) return;
  pollCount++; // Properly incremented
  // ... improved polling logic
  setTimeout(() => poll(), 500);
};
```

### Chatbot.tsx - Draft Chat Fix

```typescript
// BEFORE
if (chatState.currentChat) {
  await apiService.updateChat(chatState.currentChat.id, { model: modelId });
}

// AFTER
if (chatState.currentChat) {
  if (!chatState.currentChat.isDraft) {
    // Only update saved chats
    await apiService.updateChat(chatState.currentChat.id, { model: modelId });
  }
  chatService.updateCurrentChat({ model: modelId }); // Always update local
}
```

### ModelSelectorCards.tsx - Auto Selection

```typescript
// ADDED
if (!selectedModel && modelsWithIcons.length > 0) {
  onModelChange(modelsWithIcons[0].id);
}
```

### ChatSidebar.tsx - Dynamic Model

```typescript
// BEFORE
model: "gemini-pro", // Hardcoded

// AFTER
model: selectedModel || "cloud", // Dynamic with fallback
```

## Testing Results

✅ Messages now appear properly after API responses  
✅ No more 404 errors when changing models on initial page  
✅ First model auto-selected for better UX  
✅ Category chat creation uses correct selected model  
✅ Extended polling timeout prevents premature timeouts

## Commits Made

- 7584024 Prettier format pending files
- 3fbcf64 Pass selectedModel to ChatSidebar
- c34edb8 Use selectedModel in category chat
- c198552 Add selectedModel parameter to ChatSidebar
- 9cf5ccd Add selectedModel prop to ChatSidebar

All changes are committed locally and ready to push!
