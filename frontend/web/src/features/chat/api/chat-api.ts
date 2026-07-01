import { apiRequest } from "@/infrastructure/http/api-client"
import { env } from "@/env"
import { useMessagesStore, Conversation } from "../presentation/store/messages-store"

export class ChatApi {
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
