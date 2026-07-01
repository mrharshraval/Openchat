import { create } from "zustand"
import { wsGateway } from "@/infrastructure/websocket/ws-gateway"

export interface Notification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: "system" | "match" | "friend"
  createdAt?: string
}

interface NotificationState {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: "1",
      title: "New Match Available!",
      description: "Someone with shared interests in Gaming and Tech wants to chat.",
      time: "2 mins ago",
      read: false,
      type: "match",
      createdAt: new Date(Date.now() - 120000).toISOString()
    }
  ],

  addNotification: (notification) => set((state) => ({
    notifications: [
      { 
        ...notification, 
        id: crypto.randomUUID(), 
        read: false,
        createdAt: new Date().toISOString()
      },
      ...state.notifications
    ]
  })),

  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => 
      n.id === id ? { ...n, read: true } : n
    )
  })),

  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true }))
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id)
  })),

  clearAll: () => set({ notifications: [] })
}))

// Optional: listen to WS events for new notifications
if (typeof window !== "undefined") {
  wsGateway.on("notification", (payload: any) => {
    useNotificationStore.getState().addNotification({
      title: payload.title || "New Notification",
      description: payload.description || "",
      time: "Just now",
      type: payload.type || "system"
    })
  })
}
