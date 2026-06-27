import { create } from "zustand"
import { apiRequest } from "@/lib/api-client"

export interface User {
  id: string
  name: string | null
  username: string | null
  image: string | null
  email: string | null
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface Conversation {
  id: string
  isGroup: boolean
  name: string | null
  isPinned: boolean
  isArchived: boolean
  isMuted: boolean
  unreadCount: number
  participants: User[]
  latestMessage: Message | null
  status: string
  updatedAt: string
}

interface ChatState {
  conversations: Conversation[]
  isLoading: boolean
  error: string | null
  filter: "all" | "archived" | "requests"
  searchQuery: string
  selectedChatId: string | null
  
  // Actions
  setFilter: (filter: "all" | "archived" | "requests") => void
  setSearchQuery: (query: string) => void
  setSelectedChatId: (id: string | null) => void
  fetchConversations: (userId: string) => Promise<void>
  updateConversationSettings: (id: string, userId: string, settings: Partial<Conversation>) => Promise<void>
  deleteConversation: (id: string, userId: string, clearOnly?: boolean) => Promise<void>
  sendFriendRequest: (receiverId: string, senderId: string) => Promise<void>
  acceptFriendRequest: (friendshipId: string, userId: string) => Promise<void>
  
  // Real-time actions
  addMessage: (conversationId: string, message: Message) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  isLoading: false,
  error: null,
  filter: "all",
  searchQuery: "",
  selectedChatId: null,

  setFilter: (filter) => set({ filter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedChatId: (selectedChatId) => set({ selectedChatId }),

  fetchConversations: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await apiRequest(`http://localhost:3001/api/conversations?userId=${userId}`)
      if (!res.ok) throw new Error("Failed to fetch conversations")
      const data = await res.json()
      set({ conversations: data.conversations, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  updateConversationSettings: async (id: string, userId: string, settings: Partial<Conversation>) => {
    // Optimistic update
    const previousConversations = get().conversations
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, ...settings } : c
      ),
    }))

    try {
      const res = await apiRequest(`http://localhost:3001/api/conversations/${id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...settings }),
      })
      if (!res.ok) throw new Error("Failed to update settings")
    } catch (error) {
      // Revert on failure
      set({ conversations: previousConversations })
      console.error(error)
    }
  },

  deleteConversation: async (id: string, userId: string, clearOnly = false) => {
    const previousConversations = get().conversations
    
    // Optimistic update
    if (clearOnly) {
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === id ? { ...c, latestMessage: null } : c
        ),
      }))
    } else {
      set((state) => ({
        conversations: state.conversations.filter((c) => c.id !== id),
        selectedChatId: state.selectedChatId === id ? null : state.selectedChatId
      }))
    }

    try {
      const res = await apiRequest(`http://localhost:3001/api/conversations/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, clearOnly }),
      })
      if (!res.ok) throw new Error("Failed to delete conversation")
      
      if (!clearOnly) {
        // Optimistically update status if not fully deleted (which depends on friends/guest)
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, status: "ENDED", latestMessage: null } : c
          ),
        }))
      }
    } catch (error) {
      // Revert on failure
      set({ conversations: previousConversations })
      console.error(error)
    }
  },

  sendFriendRequest: async (receiverId: string, senderId: string) => {
    try {
      const res = await apiRequest(`http://localhost:3001/api/friends/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId, receiverId }),
      })
      if (!res.ok) throw new Error("Failed to send friend request")
    } catch (error) {
      console.error(error)
    }
  },

  acceptFriendRequest: async (friendshipId: string, userId: string) => {
    try {
      const res = await apiRequest(`http://localhost:3001/api/friends/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId, userId }),
      })
      if (!res.ok) throw new Error("Failed to accept friend request")
    } catch (error) {
      console.error(error)
    }
  },

  addMessage: (conversationId: string, message: Message) => {
    set((state) => ({
      conversations: state.conversations.map((c) => {
        if (c.id === conversationId) {
          return { ...c, latestMessage: message, updatedAt: message.createdAt, unreadCount: c.unreadCount + 1 }
        }
        return c
      }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    }))
  },

  updateConversation: (id: string, updates: Partial<Conversation>) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }))
  }
}))
