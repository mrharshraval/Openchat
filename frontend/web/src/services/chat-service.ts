import { apiRequest } from "@/lib/api-client"
import { env } from "@/env"
import { useChatStore, Conversation } from "@/stores/chat-store"

export class ChatService {
  static async fetchConversations(cursor?: string): Promise<void> {
    const store = useChatStore.getState()
    useChatStore.setState({ isLoading: true, error: null })
    
    try {
      let url = `${env.NEXT_PUBLIC_API_URL}/api/conversations?limit=25`
      if (cursor) url += `&cursor=${cursor}`
      
      const res = await apiRequest(url)
      if (!res.ok) throw new Error("Failed to fetch conversations")
      const json = await res.json()
      const data = json.data || json
      
      useChatStore.setState((state) => ({ 
        conversations: cursor ? [...(state.conversations || []), ...(data.conversations || [])] : (data.conversations || []),
        nextCursor: data.nextCursor,
        hasMore: data.nextCursor !== null,
        isLoading: false 
      }))
    } catch (err: any) {
      useChatStore.setState({ error: err.message, isLoading: false })
      throw err
    }
  }

  static async updateConversationSettings(id: string, settings: Partial<Conversation>): Promise<void> {
    const store = useChatStore.getState()
    const previousConversations = store.conversations || []
    
    // Optimistic update
    useChatStore.setState((state) => ({
      conversations: (state.conversations || []).map((c) =>
        c.id === id ? { ...c, ...settings } : c
      ),
    }))

    try {
      const res = await apiRequest(`${env.NEXT_PUBLIC_API_URL}/api/conversations/${id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error("Failed to update settings")
    } catch (error) {
      // Revert on failure
      useChatStore.setState({ conversations: previousConversations })
      console.error(error)
      throw error
    }
  }

  static async deleteConversation(id: string, clearOnly = false): Promise<void> {
    const store = useChatStore.getState()
    const previousConversations = store.conversations || []
    
    // Optimistic update
    if (clearOnly) {
      useChatStore.setState((state) => ({
        conversations: (state.conversations || []).map((c) =>
          c.id === id ? { ...c, lastMessagePreview: null } : c
        ),
      }))
    } else {
      useChatStore.setState((state) => ({
        conversations: (state.conversations || []).filter((c) => c.id !== id),
        selectedChatId: state.selectedChatId === id ? null : state.selectedChatId
      }))
    }

    try {
      const res = await apiRequest(`${env.NEXT_PUBLIC_API_URL}/api/conversations/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearOnly }),
      })
      if (!res.ok) {
        const errText = await res.text()
        console.error("Delete conversation failed on backend:", errText)
        throw new Error(`Failed to delete conversation: ${errText}`)
      }
      
      if (!clearOnly) {
        useChatStore.setState((state) => ({
          conversations: (state.conversations || []).map((c) =>
            c.id === id ? { ...c, status: "ENDED", lastMessagePreview: null } : c
          ),
          selectedChatId: state.selectedChatId === id ? null : state.selectedChatId
        }))
      } else {
        useChatStore.setState((state) => ({
          messagesByChatId: {
            ...state.messagesByChatId,
            [id]: [],
          }
        }))
      }
    } catch (error) {
      // Revert on failure
      useChatStore.setState({ conversations: previousConversations })
      console.error(error)
      throw error
    }
  }

  static async sendConnectionRequest(receiverId: string, senderId: string): Promise<void> {
    try {
      const res = await apiRequest(`${env.NEXT_PUBLIC_API_URL}/api/connections/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId, receiverId }),
      })
      if (!res.ok) throw new Error("Failed to send connection request")
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  static async acceptConnectionRequest(connectionId: string, userId: string): Promise<void> {
    try {
      const res = await apiRequest(`${env.NEXT_PUBLIC_API_URL}/api/connections/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, userId }),
      })
      if (!res.ok) throw new Error("Failed to accept connection request")
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}
