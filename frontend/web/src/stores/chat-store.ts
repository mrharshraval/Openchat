import { create } from "zustand"

export interface User {
  id: string
  name: string | null
  username: string | null
  image: string | null
  email: string | null
}

export interface Message {
  id: string
  clientMessageId?: string
  conversationId?: string
  senderId?: string
  sender: "user" | "stranger"
  status?: "SENDING" | "DELIVERED" | "PERSISTED" | "FAILED"
  content: string
  time: string
  createdAt?: string
  updatedAt?: string
  seen?: boolean
  edited?: boolean
  reactions?: Record<string, string[]>
  replyTo?: {
    id: string
    sender: "user" | "stranger"
    content: string
  }
}

export interface Conversation {
  id: string
  type: string
  name: string | null
  isPinned: boolean
  isArchived: boolean
  isMuted: boolean
  unreadCount: number
  participants: User[]
  lastMessagePreview: string | null
  lastMessageId: string | null
  status: string
  lastActivityAt: string
  updatedAt: string
}

interface ChatState {
  conversations: Conversation[]
  isLoading: boolean
  error: string | null
  filter: "all" | "archived" | "requests"
  searchQuery: string
  selectedChatId: string | null
  
  nextCursor: string | null
  hasMore: boolean
  
  messagesByChatId: Record<string, Message[]>
  
  activePartner: { username: string | null; nickname: string | null } | null
  
  // Actions
  setFilter: (filter: "all" | "archived" | "requests") => void
  setSearchQuery: (query: string) => void
  setSelectedChatId: (id: string | null) => void
  setActivePartner: (partner: { username: string | null; nickname: string | null } | null) => void
  
  // Real-time actions
  addMessage: (conversationId: string, message: Message) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  
  // Message Actions
  setMessages: (conversationId: string, messages: Message[]) => void
  appendMessage: (conversationId: string, message: Message) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  isLoading: false,
  error: null,
  filter: "all",
  searchQuery: "",
  selectedChatId: null,

  nextCursor: null,
  hasMore: true,

  messagesByChatId: {},
  activePartner: null,

  setFilter: (filter) => set({ filter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedChatId: (selectedChatId) => set({ selectedChatId }),
  setActivePartner: (activePartner) => set({ activePartner }),

  addMessage: (conversationId: string, message: Message) => {
    set((state) => ({
      conversations: (state.conversations || []).map((c) => {
        if (c.id === conversationId) {
          return { ...c, latestMessage: message, updatedAt: message.createdAt || new Date().toISOString(), unreadCount: c.unreadCount + 1 }
        }
        return c
      }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    }))
  },

  updateConversation: (id: string, updates: Partial<Conversation>) => {
    set((state) => ({
      conversations: (state.conversations || []).map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }))
  },

  setMessages: (conversationId: string, messages: Message[]) => {
    set((state) => ({
      messagesByChatId: {
        ...state.messagesByChatId,
        [conversationId]: messages,
      },
    }))
  },

  appendMessage: (conversationId: string, message: Message) => {
    set((state) => {
      const existing = state.messagesByChatId[conversationId] || []
      
      // Prevent duplicates by clientMessageId or id
      if (message.clientMessageId) {
        const index = existing.findIndex(m => m.clientMessageId === message.clientMessageId)
        if (index !== -1) {
          const updated = [...existing]
          updated[index] = { ...updated[index], ...message }
          return {
            messagesByChatId: {
              ...state.messagesByChatId,
              [conversationId]: updated,
            },
          }
        }
      } else if (message.id) {
         const index = existing.findIndex(m => m.id === message.id)
         if (index !== -1) {
            const updated = [...existing]
            updated[index] = { ...updated[index], ...message }
            return {
              messagesByChatId: {
                ...state.messagesByChatId,
                [conversationId]: updated,
              },
            }
         }
      }

      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [conversationId]: [...existing, message],
        },
      }
    })
  },

  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => {
    set((state) => {
      const existing = state.messagesByChatId[conversationId] || []
      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [conversationId]: existing.map((m) =>
            m.id === messageId || (m.clientMessageId && m.clientMessageId === messageId)
              ? { ...m, ...updates }
              : m
          ),
        },
      }
    })
  },
}))
