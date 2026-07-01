export type ConnectionStatus = "online" | "idle" | "offline"
export type ConnectionRelationship = "friend" | "pending" | "blocked"

export interface Connection {
  id: string
  name: string
  status: ConnectionStatus
  interests: string[]
  relationship: ConnectionRelationship
}
