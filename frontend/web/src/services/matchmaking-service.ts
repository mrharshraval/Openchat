import { wsGateway } from "@/infrastructure/ws-gateway"
import { useMatchmakingStore } from "@/stores/matchmaking-store"

let timerInterval: NodeJS.Timeout | null = null

export class MatchmakingService {
  static startMatchmaking(userId: string, targetInterests: string[]): void {
    const store = useMatchmakingStore.getState()
    
    // Set pure state
    useMatchmakingStore.setState({
      status: "searching",
      matchingSeconds: 0,
      interests: targetInterests,
      matchedSessionId: null,
    })

    if (timerInterval) clearInterval(timerInterval)
    timerInterval = setInterval(() => {
      useMatchmakingStore.getState().incrementSeconds()
    }, 1000)

    if (typeof window !== "undefined") {
      sessionStorage.setItem("moots_interests", targetInterests.join(","))
    }

    // Connect and send WS message
    wsGateway.connect()
    
    const sendJoin = () => {
      wsGateway.send("join-queue", {
        userId,
        interests: targetInterests,
        lang: "en",
        country: "global",
      })
    }

    if (wsGateway.readyState === WebSocket.OPEN) {
      sendJoin()
    } else {
      const handleOpen = () => {
        sendJoin()
        wsGateway.off("open", handleOpen)
      }
      wsGateway.on("open", handleOpen)
    }
  }

  static cancelMatchmaking(): void {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    
    if (wsGateway.readyState === WebSocket.OPEN) {
      wsGateway.send("leave-queue", {}) 
    }

    useMatchmakingStore.setState({ status: "idle", matchingSeconds: 0 })
  }

  static reset(): void {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    useMatchmakingStore.setState({ status: "idle", matchingSeconds: 0, matchedSessionId: null })
  }

  static initListeners(): void {
    if (typeof window === "undefined") return

    wsGateway.on("match-found", (payload: any) => {
      if (payload?.sessionId) {
        const state = useMatchmakingStore.getState()
        if (state.status === "searching") {
          if (timerInterval) {
            clearInterval(timerInterval)
            timerInterval = null
          }
          useMatchmakingStore.setState({
            status: "found",
            matchedSessionId: payload.sessionId,
          })
        }
      }
    })
  }
}
