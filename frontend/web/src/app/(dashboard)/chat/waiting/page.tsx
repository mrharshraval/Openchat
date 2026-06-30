"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Globe, Tag, Ban, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useChatStore } from "@/stores/chat-store"
import { ChatService } from "@/services/chat-service"
import { useMatchmakingStore } from "@/stores/matchmaking-store"
import { MatchmakingService } from "@/services/matchmaking-service"

import { env } from "@/env"

function MatchingQueueContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Extract parameters to display them
  const interestsParam = searchParams.get("interests")
  const langParam = searchParams.get("lang") || "en"
  const countryParam = searchParams.get("country") || "global"
  
  const interestsList = interestsParam ? interestsParam.split(",") : []

  const seconds = useMatchmakingStore((state) => state.matchingSeconds)
  const status = useMatchmakingStore((state) => state.status)
  const matchedSessionId = useMatchmakingStore((state) => state.matchedSessionId)

  // Generate or retrieve persistent userId for queue tracking
  const [userId, setUserId] = React.useState<string>("")

  React.useEffect(() => {
    let uId = sessionStorage.getItem("moots_userId")
    if (!uId) {
      uId = `user-${Math.random().toString(36).slice(2, 11)}`
      sessionStorage.setItem("moots_userId", uId)
    }
    setUserId(uId)
  }, [])

  React.useEffect(() => {
    if (!userId) return

    MatchmakingService.startMatchmaking(userId, interestsList)

    return () => {
      // Don't cancel matchmaking automatically here on simple remounts, 
      // but standard cleanup can be handled.
    }
  }, [userId])

  React.useEffect(() => {
    if (status === "found" && matchedSessionId) {
      ChatService.fetchConversations()
      router.push(`/chat/${matchedSessionId}`)
    }
  }, [status, matchedSessionId, router])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0")
    const s = (secs % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  const handleCancel = () => {
    MatchmakingService.cancelMatchmaking()
    router.push("/chat")
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-background overflow-y-auto">
      <Card className="w-full max-w-md border border-border bg-card shadow-sm rounded-2xl text-center relative overflow-hidden">
        <CardHeader className="pb-4 relative z-10">
          <Badge variant="secondary" className="mx-auto mb-2 text-[10px] font-medium uppercase tracking-wider bg-secondary text-secondary-foreground border border-border/40 hover:bg-secondary/80">
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Matching Queue
          </Badge>
          <CardTitle className="text-xl font-bold tracking-tight">Finding a Stranger</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Matching queue active. Connecting you to a random peer.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10 py-6">
          {/* Pulse Circle */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted/30 border border-border/40 relative">
            <div className="absolute inset-2 rounded-full bg-muted/50 animate-pulse" />
            <Globe className="h-8 w-8 text-foreground animate-bounce" />
          </div>

          {/* Time Counter */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-mono font-bold tracking-tight text-foreground">
              {formatTime(seconds)}
            </span>
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Elapsed Time</span>
          </div>

          {/* Applied filters summary */}
          <div className="border-t border-border pt-4 flex flex-col gap-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Queue Settings</span>
            <div className="flex flex-wrap justify-center gap-1.5">
              <Badge variant="outline" className="text-[9px] uppercase border-border">
                Lang: {langParam}
              </Badge>
              <Badge variant="outline" className="text-[9px] uppercase border-border">
                Region: {countryParam}
              </Badge>
              {interestsList.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[9px] bg-secondary text-secondary-foreground">
                  #{tag}
                </Badge>
              ))}
              {interestsList.length === 0 && (
                <Badge variant="outline" className="text-[9px] text-muted-foreground border-dashed">
                  Fully Random
                </Badge>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2 pb-6 relative z-10">
          <Button variant="outline" onClick={handleCancel} className="w-full h-10 text-xs font-semibold border-border flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground rounded-xl transition-colors cursor-pointer bg-background hover:bg-muted/40">
            <Ban className="h-4 w-4" />
            CANCEL SEARCH
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function MatchingQueueFallback() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border border-border bg-card shadow-sm text-center relative overflow-hidden">
        <CardHeader className="pb-4">
          <Badge variant="secondary" className="mx-auto mb-2 text-[10px] font-medium uppercase tracking-wider bg-secondary text-secondary-foreground border border-border/40 hover:bg-secondary/80">
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Matching Queue
          </Badge>
          <CardTitle className="text-xl font-bold tracking-tight">Loading Queue...</CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted/30 border border-border/40">
            <Loader2 className="h-8 w-8 text-foreground animate-spin" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function MatchingQueuePage() {
  return (
    <React.Suspense fallback={<MatchingQueueFallback />}>
      <MatchingQueueContent />
    </React.Suspense>
  )
}
