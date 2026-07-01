import * as React from "react"
import { Search } from "lucide-react"
import { Connection } from "../types/connection.types"
import { ConnectionCard } from "./connection-card"

interface ConnectionListProps {
  connections: Connection[]
  onAccept: (id: string) => void
  onDecline: (id: string) => void
  onRemove: (id: string) => void
  onUnblock: (id: string) => void
}

export function ConnectionList({ connections, onAccept, onDecline, onRemove, onUnblock }: ConnectionListProps) {
  if (connections.length === 0) {
    return (
      <div className="col-span-full text-center py-16 border border-dashed border-border rounded-xl bg-card">
        <Search className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">No friends found</p>
      </div>
    )
  }

  return (
    <>
      {connections.map((connection) => (
        <ConnectionCard
          key={connection.id}
          connection={connection}
          onAccept={onAccept}
          onDecline={onDecline}
          onRemove={onRemove}
          onUnblock={onUnblock}
        />
      ))}
    </>
  )
}
