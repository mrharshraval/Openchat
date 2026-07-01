import { create } from "zustand"
import { Connection } from "../types/connection.types"

interface ConnectionsState {
  connections: Connection[]
  setConnections: (connections: Connection[]) => void
  updateConnection: (id: string, updates: Partial<Connection>) => void
  removeConnection: (id: string) => void
}

export const useConnectionsStore = create<ConnectionsState>((set) => ({
  connections: [
    { id: "1", name: "Alex", status: "online", interests: ["gaming", "movies"], relationship: "friend" },
    { id: "2", name: "Sarah", status: "idle", interests: ["music", "art"], relationship: "friend" },
    { id: "3", name: "Jake", status: "offline", interests: ["technology", "gaming"], relationship: "friend" },
    { id: "4", name: "Emma Watson", status: "offline", interests: ["movies", "books"], relationship: "pending" },
    { id: "5", name: "ToxicTroll", status: "offline", interests: [], relationship: "blocked" },
  ],
  setConnections: (connections) => set({ connections }),
  updateConnection: (id, updates) => set((state) => ({
    connections: state.connections.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  removeConnection: (id) => set((state) => ({
    connections: state.connections.filter(c => c.id !== id)
  }))
}))
