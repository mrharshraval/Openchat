"use client"

import * as React from "react"
import { Bell, Check, Trash2, UserPlus, Flame, AlertCircle } from "lucide-react"
import { SidebarHeader, SidebarContent, SidebarTrigger } from "@/shared/ui/sidebar"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { cn } from "@/shared/utils/utils"

import { useNotificationStore } from "@/features/notifications/store/notification-store"

export function NotificationsPanel() {
  const notifications = useNotificationStore((state) => state.notifications)
  const markAsRead = useNotificationStore((state) => state.markAsRead)
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead)
  const removeNotification = useNotificationStore((state) => state.removeNotification)
  
  const [filter, setFilter] = React.useState<"all" | "unread">("all")
  
  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAllRead = () => {
    markAllAsRead()
  }

  const handleDelete = (id: string) => {
    removeNotification(id)
  }

  const handleToggleRead = (id: string) => {
    markAsRead(id)
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read
    return true
  })

  return (
    <>
      <SidebarHeader className="flex-row items-center justify-between px-2 h-14 shrink-0 relative border-b border-transparent">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden size-8 [&_svg]:size-4" />
          <h2 className="text-lg font-bold tracking-tight">Notifications</h2>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="h-8 px-2 text-[10px] text-muted-foreground hover:text-foreground"
          >
            <Check className="h-3 w-3 mr-1" /> Mark all read
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 overflow-y-auto pt-1">
        <div className="flex items-center gap-2 mb-2 h-10 px-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="h-8 text-xs rounded-full px-4"
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
            className="h-8 text-xs rounded-full px-4 flex items-center gap-1.5"
          >
            Unread
            {unreadCount > 0 && (
              <Badge variant={filter === "unread" ? "secondary" : "default"} className="px-1 py-0 text-[10px] h-4 min-w-4 flex items-center justify-center rounded-full bg-primary/20 text-primary-foreground border-none">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center opacity-50 px-2">
            <Bell className="h-8 w-8 mb-2 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">All caught up!</span>
          </div>
        ) : (
          <div className="flex-1">
            {filteredNotifications.map((notification) => {
            const Icon =
              notification.type === "friend"
                ? UserPlus
                : notification.type === "match"
                ? Flame
                : AlertCircle

            return (
              <div
                key={notification.id}
                className={cn(
                  "p-3 rounded-xl border relative group cursor-pointer",
                  !notification.read
                    ? "bg-primary/5 border-primary/20"
                    : "bg-transparent border-transparent hover:bg-muted/50"
                )}
              >
                <div className="flex gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0",
                      notification.type === "friend"
                        ? "bg-blue-500/10 text-blue-500"
                        : notification.type === "match"
                        ? "bg-orange-500/10 text-orange-500"
                        : "bg-red-500/10 text-red-500"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-foreground truncate">
                        {notification.title}
                      </h4>
                      <span className="text-[9px] text-muted-foreground shrink-0">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
                      {notification.description}
                    </p>
                  </div>
                </div>

                <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleRead(notification.id)
                    }}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(notification.id)
                    }}
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )
          })}
          </div>
        )}
      </SidebarContent>
    </>
  )
}
