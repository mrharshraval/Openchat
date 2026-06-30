import { create } from "zustand"
import { wsGateway } from "@/infrastructure/ws-gateway"

export type MatchmakingStatus = "idle" | "searching" | "found"

interface MatchmakingState {
  status: MatchmakingStatus
  matchingSeconds: number
  interests: string[]
  matchedSessionId: string | null
  
  setStatus: (status: MatchmakingStatus) => void
  setMatchedSessionId: (id: string | null) => void
  incrementSeconds: () => void
  setInterests: (interests: string[]) => void
}

export const useMatchmakingStore = create<MatchmakingState>((set) => ({
  status: "idle",
  matchingSeconds: 0,
  interests: ["gaming", "music", "movies"],
  matchedSessionId: null,

  setStatus: (status) => set({ status }),
  setMatchedSessionId: (id) => set({ matchedSessionId: id }),
  incrementSeconds: () => set((state) => ({ matchingSeconds: state.matchingSeconds + 1 })),
  setInterests: (interests) => set({ interests }),
}))
