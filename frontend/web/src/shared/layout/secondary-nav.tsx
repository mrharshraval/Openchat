"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Bell, Check, Trash2, UserPlus, Flame, AlertCircle } from "lucide-react"
import { Sidebar, SidebarContent, SidebarHeader, SidebarTrigger } from "@/shared/ui/sidebar"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { cn } from "@/shared/utils/utils"

import { useNotificationStore } from "@/features/notifications"
import { ConversationList } from "@/features/conversations"
import { NotificationsPanel } from "@/features/notifications"

export function SecondaryNav() {
  const pathname = usePathname()
  
  // Only render on /chat or /notifications
  const isChat = pathname.startsWith("/chat")
  const isNotifications = pathname.startsWith("/notifications")
  const isRoot = pathname === "/chat" || pathname === "/notifications"

  if (!isChat && !isNotifications) {
    return null
  }

  return (
    <Sidebar
      collapsible="none"
      className={cn(
        "border-r border-black/[0.06] dark:border-white/[0.06] bg-background/50",
        isRoot ? "flex" : "hidden md:flex",
        "w-full md:w-[360px] shrink-0"
      )}
      style={{ "--sidebar-width": "360px" } as React.CSSProperties}
    >
      {isChat && <ConversationList />}
      {isNotifications && <NotificationsPanel />}
    </Sidebar>
  )
}


