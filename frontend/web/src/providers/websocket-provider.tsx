"use client"

import React, { createContext, useContext, ReactNode, useEffect } from "react"
import { useWsGateway } from "@/shared/hooks/use-ws-gateway"
import { MatchmakingService } from "@/services/matchmaking-service"

const WebSocketContext = createContext<ReturnType<typeof useWsGateway> | null>(null)

interface WebSocketProviderProps {
  children: ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const ws = useWsGateway()

  // Initialize the global gateway connection when this provider mounts
  useEffect(() => {
    ws.connect()
    MatchmakingService.initListeners()
    
    return () => {
      ws.disconnect()
    }
  }, [ws])

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useGlobalWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error("useGlobalWebSocket must be used within a WebSocketProvider")
  }
  return context
}
