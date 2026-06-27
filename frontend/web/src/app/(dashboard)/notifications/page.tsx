"use client"

import * as React from "react"
import { Bell } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-background items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4 flex flex-col items-center">
        <div className="bg-primary/5 p-4 rounded-full text-primary/40 mb-2">
          <Bell className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Notifications
        </h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          Select a notification from the list to view its details.
        </p>
      </div>
    </div>
  )
}
