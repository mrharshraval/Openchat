import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useMatchmakingStore } from "../presentation/store/matchmaking-store"
import { wsGateway } from "@/infrastructure/websocket/ws-gateway"
import { useActorSession } from "@/features/auth"

export function useMatchmakingFlow() {
  const router = useRouter()
  const { actorId, displayName, username } = useActorSession()
  const { status, setStatus, matchedSessionId, setMatchedSessionId } = useMatchmakingStore()
  
  const [interests, setInterests] = useState<string[]>(["gaming", "music", "movies"])
  const [seconds, setSeconds] = useState(0)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem("moots_interests")
    if (saved) {
      setInterests(saved.split(",").filter(Boolean))
    }
  }, [])

  useEffect(() => {
    if (status === "searching") {
      setSeconds(0)
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [status])

  useEffect(() => {
    if (status !== "searching") return

    const handleMatchFound = (payload: any) => {
      if (payload?.sessionId) {
        setStatus("found")
        setMatchedSessionId(payload.sessionId)
        setTimeout(() => {
          router.push(`/chat/${payload.sessionId}`)
        }, 1200)
      }
    }

    wsGateway.on("match-found", handleMatchFound)
    
    return () => {
      wsGateway.off("match-found", handleMatchFound)
    }
  }, [status, router, setStatus, setMatchedSessionId])

  const startMatchmaking = (targetInterests?: string[]) => {
    const activeInterests = targetInterests || interests
    sessionStorage.setItem("moots_interests", activeInterests.join(","))
    setInterests(activeInterests)
    setStatus("searching")
    setMatchedSessionId(null)

    wsGateway.connect()

    const sendJoin = () => {
      wsGateway.send("join-queue", {
        userId: actorId,
        nickname: displayName,
        username: username,
        interests: activeInterests,
        lang: "en",
        country: "global",
      })
    }

    if (wsGateway.readyState === 1) {
      sendJoin()
    } else {
      const handleOpen = () => {
        sendJoin()
        wsGateway.off("open", handleOpen)
      }
      wsGateway.on("open", handleOpen)
    }
  }

  const cancelMatchmaking = () => {
    setStatus("idle")
    if (wsGateway.readyState === 1) {
      wsGateway.send("leave-queue", {}) 
    }
  }

  return {
    status,
    seconds,
    interests,
    setInterests,
    startMatchmaking,
    cancelMatchmaking
  }
}
