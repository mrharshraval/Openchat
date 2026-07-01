import * as React from "react"
import { useConnectionsStore } from "../store/connections-store"

export type TabType = "online" | "all" | "pending" | "blocked"

export function useConnections() {
  const connections = useConnectionsStore((state) => state.connections)
  
  const [activeTab, setActiveTab] = React.useState<TabType>("online")
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredConnections = React.useMemo(() => {
    return connections.filter((c) => {
      if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      if (activeTab === "online") return c.relationship === "friend" && c.status !== "offline"
      if (activeTab === "all") return c.relationship === "friend"
      if (activeTab === "pending") return c.relationship === "pending"
      if (activeTab === "blocked") return c.relationship === "blocked"
      return true
    })
  }, [connections, activeTab, searchQuery])

  return {
    connections,
    filteredConnections,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery
  }
}
