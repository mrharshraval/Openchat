import { useConnectionsStore } from "../store/connections-store"

export function useConnectionActions() {
  const updateConnection = useConnectionsStore((state) => state.updateConnection)
  const removeConnection = useConnectionsStore((state) => state.removeConnection)

  const handleAcceptRequest = (id: string) => {
    updateConnection(id, { relationship: "friend", status: "online" })
  }

  const handleDeclineRequest = (id: string) => {
    removeConnection(id)
  }

  const handleRemoveFriend = (id: string) => {
    removeConnection(id)
  }

  const handleUnblock = (id: string) => {
    removeConnection(id)
  }

  return {
    handleAcceptRequest,
    handleDeclineRequest,
    handleRemoveFriend,
    handleUnblock
  }
}
