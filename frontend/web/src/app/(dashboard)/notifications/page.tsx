"use client"

import * as React from "react"
import { Bell, Check, Trash2, UserPlus, Flame, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: "system" | "match" | "friend"
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: "1",
      title: "New Match Available!",
      description: "Someone with shared interests in Gaming and Tech wants to chat.",
      time: "2 mins ago",
      read: false,
      type: "match",
    },
    {
      id: "2",
      title: "Friend Request Received",
      description: "Alex (gaming enthusiast) sent you a friend request.",
      time: "1 hour ago",
      read: false,
      type: "friend",
    },
    {
      id: "3",
      title: "System Maintenance",
      description: "Scheduled database upgrades on June 20th, 02:00 UTC.",
      time: "1 day ago",
      read: true,
      type: "system",
    },
    {
      id: "4",
      title: "Match Streak!",
      description: "You've made 5 successful chat matches today. Keep it up!",
      time: "2 days ago",
      read: true,
      type: "match",
    },
  ])

  const [filter, setFilter] = React.useState<"all" | "unread">("all")

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    )
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read
    return true
  })

  return (
    <div className="flex-1 flex flex-col h-full bg-background p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
              <p className="text-sm text-muted-foreground">Manage your alerts and activity updates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-xs text-muted-foreground hover:text-foreground font-medium"
              >
                <Check className="h-4 w-4 mr-1.5" /> Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Filters & Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all ${
                filter === "all"
                  ? "bg-primary border-primary text-primary-foreground shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all flex items-center gap-1.5 ${
                filter === "unread"
                  ? "bg-primary border-primary text-primary-foreground shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="px-1.5 py-0.5 text-[10px] font-bold">
                  {unreadCount}
                </Badge>
              )}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl bg-card">
              <Bell className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon =
                notification.type === "friend"
                  ? UserPlus
                  : notification.type === "match"
                  ? Flame
                  : AlertCircle

              return (
                <Card
                  key={notification.id}
                  className={`p-4 transition-all duration-200 border relative group ${
                    !notification.read
                      ? "bg-primary/5 border-primary/20 shadow-sm"
                      : "bg-card hover:bg-muted/30 border-border"
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Notification Icon */}
                    <div
                      className={`p-2.5 rounded-lg h-fit ${
                        notification.type === "friend"
                          ? "bg-blue-500/10 text-blue-500"
                          : notification.type === "match"
                          ? "bg-orange-500/10 text-orange-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-12">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-foreground truncate">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {notification.description}
                      </p>
                      <span className="text-[10px] text-muted-foreground/60 font-medium mt-2 block">
                        {notification.time}
                      </span>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleRead(notification.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(notification.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
