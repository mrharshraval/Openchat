import { create } from "zustand"

export type MatchmakingStatus = "idle" | "searching" | "found"

interface MatchmakingState {
  status: MatchmakingStatus
  matchedSessionId: string | null
  
  setStatus: (status: MatchmakingStatus) => void
  setMatchedSessionId: (id: string | null) => void
}

export const useMatchmakingStore = create<MatchmakingState>((set) => ({
  status: "idle",
  matchedSessionId: null,

  setStatus: (status) => set({ status }),
  setMatchedSessionId: (id) => set({ matchedSessionId: id }),
}))
