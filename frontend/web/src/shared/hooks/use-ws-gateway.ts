import { useEffect, useState } from "react"
import { wsGateway, WsEventHandler } from "@/infrastructure/ws-gateway"

export function useWsGateway() {
  const [status, setStatus] = useState<number>(wsGateway.readyState)

  useEffect(() => {
    const handleOpen = () => setStatus(WebSocket.OPEN)
    const handleClose = () => setStatus(WebSocket.CLOSED)

    wsGateway.on("open", handleOpen)
    wsGateway.on("close", handleClose)

    // Initial status check
    setStatus(wsGateway.readyState)

    return () => {
      wsGateway.off("open", handleOpen)
      wsGateway.off("close", handleClose)
    }
  }, [])

  return {
    status,
    connect: () => wsGateway.connect(),
    disconnect: () => wsGateway.disconnect(),
    send: (type: string, payload: any = {}) => wsGateway.send(type, payload),
    on: (type: string, handler: WsEventHandler) => wsGateway.on(type, handler),
    off: (type: string, handler: WsEventHandler) => wsGateway.off(type, handler)
  }
}
