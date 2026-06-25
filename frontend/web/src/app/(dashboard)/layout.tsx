"use client"

import * as React from "react"
import { Info } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { SidebarNav } from "@/components/panels/sidebar-nav"
import { useIsMobile } from "@/hooks/use-mobile"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSession } from "next-auth/react"
import { getOrInitializeNickname } from "@/lib/nickname"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const { data: session } = useSession()

  const [displayName, setDisplayName] = React.useState("Guest")
  const [partnerName, setPartnerName] = React.useState<string | null>(null)

  React.useEffect(() => {
    const user = session?.user
    if (user) {
      setDisplayName(user.name || (user as any).username || user.email?.split("@")[0] || "User")
    } else {
      setDisplayName(getOrInitializeNickname())
    }
  }, [session])

  React.useEffect(() => {
    const handlePartner = (e: Event) => {
      const customEvent = e as CustomEvent
      const { username, nickname } = customEvent.detail
      setPartnerName(username || nickname || null)
    }
    window.addEventListener("moots:partner-loaded", handlePartner)
    return () => {
      window.removeEventListener("moots:partner-loaded", handlePartner)
    }
  }, [])

  React.useEffect(() => {
    let pageName = ""
    if (pathname === "/chat") {
      pageName = "Chats"
    } else if (pathname === "/chat/waiting") {
      pageName = "Matching..."
    } else if (pathname === "/chat/disconnected") {
      pageName = "Disconnected"
    } else if (pathname.startsWith("/chat/")) {
      pageName = "Direct Message"
    } else if (pathname === "/friends") {
      pageName = "Friends"
    } else if (pathname === "/groups") {
      pageName = "Groups"
    } else if (pathname === "/notifications") {
      pageName = "Notifications"
    }

    if (pageName) {
      document.title = `${pageName} • Moots`
    } else {
      document.title = "Moots"
    }
  }, [pathname])

  const initials = displayName.substring(0, 2).toUpperCase()

  return (
    <SidebarProvider
      defaultOpen={true}
      style={
        {
          "--sidebar-width": "15rem",        /* 240px — standard sidebar width */
          "--sidebar-width-icon": "3.5rem",  /* 56px — icon-only collapsed */
        } as React.CSSProperties
      }
      className="h-screen overflow-hidden"
    >
      <SidebarNav />

      <SidebarInset className="flex flex-col h-screen overflow-hidden bg-background">

        {/* ── HEADER ── */}
        {/*
          h-14 (56px) — matches sidebar header height for visual alignment.
          px-4 — standard content padding.
        */}
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between px-4 bg-background/95 backdrop-blur-md">

          {/* LEFT: expand trigger (when sidebar collapsed) + avatar + name */}
          <div className="flex items-center gap-3">
            {/* Show when sidebar is in icon-only mode */}
            <SidebarTrigger className="size-9 text-muted-foreground hover:text-foreground hover:bg-accent hidden peer-data-[state=collapsed]:flex [&_svg]:size-5" />
            {isMobile && (
              <SidebarTrigger className="size-9 text-muted-foreground hover:text-foreground hover:bg-accent [&_svg]:size-5" />
            )}
            <div className="flex items-center gap-2.5">
              <Avatar className="size-8">
                <AvatarFallback className="text-sm font-semibold bg-foreground/10">
                  {partnerName ? partnerName.substring(0, 2).toUpperCase() : initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-semibold leading-none">
                {partnerName ? partnerName : displayName}
              </span>
            </div>
          </div>

          {/* RIGHT: auth buttons when not logged in */}
          {!session && (
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="sm" className="text-[13px] text-muted-foreground hover:text-foreground">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="text-[13px] h-8">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

        </header>

        {/* ── PAGE CONTENT ── */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {children}
        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
