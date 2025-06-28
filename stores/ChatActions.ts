import cuid from "cuid";
import { Message } from "./Message";
import { Chat } from "./Chat";
import { getChatById, updateChatMessages } from "./utils";
import { NextRouter } from "next/router";
import { APIState, ChatState, useChatStore } from "./ChatStore";
import { submitMessage } from "./SubmitMessage";
import { fetchModels } from "./OpenAI";

const get = useChatStore.getState;
const set = useChatStore.setState;

export const update = (newState: Partial<ChatState>) => set(() => newState);

export const clearChats = () => set(() => ({ chats: [] }));

export const deleteChat = (id: string) =>
  set((state) => ({
    chats: state.chats.filter((chat) => chat.id !== id),
  }));

// Pass userId as argument so UI can provide it from session
export const addChat = async (router: NextRouter, userId: string) => {
  
  // Fetch max order from API
  try {
    const res = await fetch('/api/add-new-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }), // Pass userId to API
    });
    
    const newChat = await res.json();

    if (newChat.chat && newChat.chat.id) {

      set((state) => ({
        activeChatId: newChat.chat.id, // Use newChat.id instead of undefined id
        chats: [
          ...state.chats,
          {
            id: newChat.chat.id,           // Use API data
            userId: newChat.chat.userId,   // Use API data
            title: newChat.chat.title,     // Use API data
            order: newChat.chat.order,     // Add order if you're using it
            messages: [],             // Start with empty messages
            createdAt: new Date(newChat.chat.createdAt), // Convert to Date
            deletedAt: newChat.chat.deletedAt ? new Date(newChat.chat.deletedAt) : null,
          },
        ],
      }));
      
      router.push(`/chat/${newChat.chat.id}`);

    } else {
      console.log('Chat non creata');
    }

  } catch (e) {
    console.error('Failed to create new chat', e);
  }
};

export const setActiveChatId = (id: string | undefined) =>
  set(() => ({ activeChatId: id }));

export const updateMessage = (message: Message) => {
  const chat = getChatById(get().chats, get().activeChatId);
  if (chat === undefined) {
    console.error("Chat not found");
    return;
  }
  set((state) => ({
    chats: updateChatMessages(state.chats, chat.id, (messages) => {
      return messages.map((m) => (m.id === message.id ? message : m));
    }),
  }));
};

export const pushMessage = (message: Message) => {
  const chat = getChatById(get().chats, get().activeChatId);
  if (chat === undefined) {
    console.error("Chat not found");
    return;
  }
  set((state) => ({
    chats: updateChatMessages(state.chats, chat.id, (messages) => {
      return [...messages, message];
    }),
  }));
};

export const delMessage = (message: Message) => {
  const chat = getChatById(get().chats, get().activeChatId);
  if (chat === undefined) {
    console.error("Chat not found");
    return;
  }
  set((state) => ({
    chats: updateChatMessages(state.chats, chat.id, (messages) => {
      return messages.filter((m) => m.id !== message.id);
    }),
  }));
};

export const setColorScheme = (scheme: "light" | "dark") =>
  set((state) => ({ colorScheme: scheme }));

export const setApiKey = (key: string) => set((state) => ({ apiKey: key }));

export const setApiKey11Labs = (key: string) =>
  set((state) => ({ apiKey11Labs: key }));

export const setApiState = (apiState: APIState) =>
  set((state) => ({ apiState }));

export const updateSettingsForm = (settingsForm: ChatState["settingsForm"]) =>
  set((state) => ({ settingsForm }));

export const updateChat = (options: Partial<Chat>) =>
  set((state) => ({
    chats: state.chats.map((c) => {
      if (c.id === options.id) {
        return { ...c, ...options };
      }
      return c;
    }),
  }));

export const setChosenCharacter = (name: string) =>
  set((state) => ({
    chats: state.chats.map((c) => {
      if (c.id === state.activeChatId) {
        c.chosenCharacter = name;
      }
      return c;
    }),
  }));

export const setNavOpened = (navOpened: boolean) =>
  set((state) => ({ navOpened }));

export const setPushToTalkMode = (pushToTalkMode: boolean) =>
  set((state) => ({ pushToTalkMode }));

export const setPlayerMode = (playerMode: boolean) => {
  set((state) => ({ playerMode }));
};

export const setEditingMessage = (editingMessage: Message | undefined) =>
  set((state) => ({ editingMessage }));

export const regenerateAssistantMessage = (message: Message) => {
  const chat = getChatById(get().chats, get().activeChatId);
  if (chat === undefined) {
    console.error("Chat not found");
    return;
  }

  // If this is an existing message, remove all the messages after it
  const index = chat.messages.findIndex((m) => m.id === message.id);

  const prevMsg = chat.messages[index - 1];
  if (prevMsg) {
    submitMessage(prevMsg);
  }
};

export const refreshModels = async () => {
  const { apiKey } = get();
  // Load OpenAI models
  if (!apiKey) return;

  try {
    const modelIDs = await fetchModels(apiKey);
    // Use only models that start with gpt-3.5 or gpt-4
    update({
      modelChoicesChat: modelIDs.filter(
        (id) => id.startsWith("gpt-3.5") || id.startsWith("gpt-4")
      ),
    });
  } catch (error) {
    console.error("Failed to fetch models:", error);
  }
};

// Helper to ensure a chat exists before input, returns chat id
export const ensureChat = async (router: any, session: any) => {
  const activeChatId = get().activeChatId;
  if (!activeChatId) {
    if (!session?.user?.id) throw new Error("No user id in session");
    const newChatId = await addChat(router, session.user.id);
    return newChatId;
  }
  return activeChatId;
};