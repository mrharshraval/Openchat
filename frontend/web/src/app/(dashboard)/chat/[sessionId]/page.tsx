"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  ArrowDown,
  CheckCheck,
  Heart,
  MoreHorizontal,
  CornerUpLeft,
  Edit3,
  Copy,
  X,
  ChevronRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useChatRoom } from "@/features/chat/hooks/use-chat-room"
import { MessageList } from "@/features/chat/components/message-list"
import { ChatInput } from "@/features/chat/components/chat-input"
import { MatchmakingService } from "@/services/matchmaking-service"
import { cn } from "@/lib/utils"

export default function ChatSessionPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params?.sessionId as string
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const { data: session } = useSession()

  const {
    userId,
    peerDisplayName,
    peerUsername,
    isStrangerDisconnected,
    setIsStrangerDisconnected,
    isTyping,
    hasRevealedIdentity,
    partnerRevealedIdentity,
    connectionStatus,
    isWsReady,
    inputText,
    setInputText,
    replyingTo,
    setReplyingTo,
    editingMsg,
    setEditingMsg,
    expandedMsgs,
    toggleExpand,
    handleReact,
    handleRevealIdentity,
    handleSendConnectionRequest,
    handleAcceptConnectionRequest,
    handleInputChange,
    handleSend,
    messages,
    isEngaged,
    lastUserMsgId
  } = useChatRoom(sessionId, session)

  // Page state computation
  const pageState = React.useMemo(() => {
    const status = useChatRoom(sessionId, session).isWsReady ? "active" : "matching"
    if (isStrangerDisconnected) return "disconnected"
    // fallback or status mapping
    return "active"
  }, [isStrangerDisconnected])

  // Scroll details
  const [showScrollBtn, setShowScrollBtn] = React.useState(false)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120)
  }

  const scrollToBottom = () =>
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })

  const startLocalMatching = () => {
    const saved = sessionStorage.getItem("moots_interests")
    const targetInterests = saved ? saved.split(",").filter(Boolean) : ["gaming", "music", "movies"]
    MatchmakingService.startMatchmaking(userId, targetInterests)
  }

  const cancelLocalMatching = () => {
    MatchmakingService.cancelMatchmaking()
    setIsStrangerDisconnected(true)
  }

  // Mobile Touch handlers
  const lastTapRef = React.useRef<{ time: number; msgId: string } | null>(null)
  const longPressTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const [activeTouchMessage, setActiveTouchMessage] = React.useState<any | null>(null)
  const [showTouchSheet, setShowTouchSheet] = React.useState(false)

  const getTouchHandlers = (msg: any) => {
    return {
      onTouchStart: () => {
        if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current)
        longPressTimeoutRef.current = setTimeout(() => {
          setActiveTouchMessage(msg)
          setShowTouchSheet(true)
          if (typeof window !== "undefined" && navigator.vibrate) {
            navigator.vibrate(50)
          }
        }, 500)
      },
      onTouchEnd: () => {
        if (longPressTimeoutRef.current) {
          clearTimeout(longPressTimeoutRef.current)
          longPressTimeoutRef.current = null
        }
        const now = Date.now()
        const lastTap = lastTapRef.current
        if (lastTap && lastTap.msgId === msg.id && now - lastTap.time < 300) {
          handleReact(msg.id, "❤️")
          lastTapRef.current = null
          if (typeof window !== "undefined" && navigator.vibrate) {
            navigator.vibrate([40, 40])
          }
        } else {
          lastTapRef.current = { time: now, msgId: msg.id }
        }
      },
      onTouchMove: () => {
        if (longPressTimeoutRef.current) {
          clearTimeout(longPressTimeoutRef.current)
          longPressTimeoutRef.current = null
        }
      },
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend(textareaRef)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Active or Disconnected (Engaged) */}
      {(pageState === "active" || (pageState === "disconnected" && isEngaged)) ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Action Bar */}
          {pageState === "active" && (
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-muted/10 shrink-0">
              <div className="text-xs text-muted-foreground flex gap-4">
                {partnerRevealedIdentity ? (
                  <span className="text-primary font-medium flex items-center gap-1.5">
                    <CheckCheck className="w-3.5 h-3.5" /> Identity Revealed
                  </span>
                ) : (
                  <span>Anonymous Chat</span>
                )}
                {connectionStatus === "accepted" && (
                  <span className="text-primary font-medium flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" /> Connected
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {!hasRevealedIdentity && session?.user && (
                  <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={handleRevealIdentity}>
                    Reveal Identity
                  </Button>
                )}
                {connectionStatus === "none" && (
                  <Button variant="secondary" size="sm" className="h-7 text-[11px]" onClick={handleSendConnectionRequest}>
                    Connect
                  </Button>
                )}
                {connectionStatus === "pending_sent" && (
                  <Button variant="secondary" size="sm" className="h-7 text-[11px]" disabled>
                    Request Sent
                  </Button>
                )}
                {connectionStatus === "pending_received" && (
                  <Button variant="secondary" size="sm" className="h-7 text-[11px] bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAcceptConnectionRequest}>
                    Accept Connection
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto custom-scrollbar">
            <MessageList
              messages={messages}
              userId={userId}
              peerDisplayName={peerDisplayName}
              lastUserMsgId={lastUserMsgId}
              expandedMsgs={expandedMsgs}
              toggleExpand={toggleExpand}
              handleReact={handleReact}
              setEditingMsg={setEditingMsg}
              setReplyingTo={setReplyingTo}
              setInputText={setInputText}
              textareaRef={textareaRef}
              getTouchHandlers={getTouchHandlers}
              isTyping={isTyping}
              pageState={pageState}
            />

            {/* Scenario 2: Engaged Conversation Ended Card */}
            {pageState === "disconnected" && isEngaged && (
              <div className="mt-8 border-t border-border/40 pt-8 pb-4 w-full">
                <div className="flex flex-col items-center text-center gap-4 max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex flex-col items-center gap-1.5">
                    <h3 className="text-md font-bold tracking-tight text-foreground">Conversation Ended</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                      {peerDisplayName} left.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2.5 w-full mt-2">
                    <Button onClick={startLocalMatching} className="w-full text-xs h-9.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/95 font-medium px-4 cursor-pointer shadow-sm">
                      Find Another Match
                    </Button>
                    <button type="button" onClick={() => router.push("/chat")} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-medium py-1.5 bg-transparent border-0">
                      Change Interests
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Scenario 1: No Engagement (Match Left) */}
      {pageState === "disconnected" && !isEngaged && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background text-foreground max-w-md mx-auto w-full">
          <div className="flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center gap-1.5">
              <h2 className="text-lg font-bold tracking-tight text-foreground">Match Left</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                They left before the conversation started.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 w-full mt-1">
              <Button onClick={startLocalMatching} className="w-full text-xs h-9.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/95 font-medium px-4 cursor-pointer shadow-sm">
                Find Another Match
              </Button>
              <button type="button" onClick={() => router.push("/chat")} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-medium py-1.5 bg-transparent border-0">
                Change Interests
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Bottom Button */}
      {showScrollBtn && pageState === "active" && (
        <Button variant="outline" size="icon" onClick={scrollToBottom} className="absolute bottom-28 left-1/2 -translate-x-1/2 size-9 rounded-full shadow-md z-30">
          <ArrowDown className="size-5" strokeWidth={2} />
        </Button>
      )}

      {/* Chat Input sticky bar */}
      {pageState === "active" && (
        <ChatInput
          inputText={inputText}
          handleInputChange={handleInputChange}
          handleKeyDown={handleKeyDown}
          editingMsg={editingMsg}
          setEditingMsg={setEditingMsg}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          peerDisplayName={peerDisplayName}
          send={() => handleSend(textareaRef)}
          isWsReady={isWsReady}
          setInputText={setInputText}
          textareaRef={textareaRef}
        />
      )}

      {/* Mobile Touch Context Sheet */}
      {showTouchSheet && activeTouchMessage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-end justify-center animate-in fade-in duration-200" onClick={() => setShowTouchSheet(false)}>
          <div className="w-full max-w-md bg-card border-t border-border rounded-t-2xl p-5 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-2" />
            
            {/* Quick Reactions */}
            <div className="flex items-center justify-between gap-1 bg-muted/30 p-2 rounded-xl border border-border/40">
              {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => {
                const isReacted = activeTouchMessage.reactions?.[emoji]?.includes(userId)
                return (
                  <button
                    key={emoji}
                    onClick={() => {
                      handleReact(activeTouchMessage.id, emoji)
                      setShowTouchSheet(false)
                    }}
                    className={cn(
                      "text-2xl w-11 h-11 flex items-center justify-center rounded-full transition-all active:scale-90 hover:bg-muted cursor-pointer border-none bg-transparent outline-none",
                      isReacted && "bg-primary/10 border border-primary/20 scale-110"
                    )}
                  >
                    {emoji}
                  </button>
                )
              })}
            </div>

            {/* Action List */}
            <div className="flex flex-col bg-muted/20 border border-border/40 rounded-xl divide-y divide-border/40">
              <button
                onClick={() => {
                  setReplyingTo(activeTouchMessage)
                  setEditingMsg(null)
                  setShowTouchSheet(false)
                  if (textareaRef.current) textareaRef.current.focus()
                }}
                className="flex items-center gap-3 w-full px-4 py-3.5 text-left text-sm font-medium text-foreground hover:bg-muted/40 transition-colors cursor-pointer border-none bg-transparent outline-none"
              >
                <CornerUpLeft className="size-4.5 text-muted-foreground" />
                Reply
              </button>

              {activeTouchMessage.sender === "user" && (
                <button
                  onClick={() => {
                    setEditingMsg(activeTouchMessage)
                    setReplyingTo(null)
                    setInputText(activeTouchMessage.content)
                    setShowTouchSheet(false)
                    if (textareaRef.current) textareaRef.current.focus()
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3.5 text-left text-sm font-medium text-foreground hover:bg-muted/40 transition-colors cursor-pointer border-none bg-transparent outline-none"
                >
                  <Edit3 className="size-4.5 text-muted-foreground" />
                  Edit Message
                </button>
              )}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeTouchMessage.content)
                  setShowTouchSheet(false)
                }}
                className="flex items-center gap-3 w-full px-4 py-3.5 text-left text-sm font-medium text-foreground hover:bg-muted/40 transition-colors cursor-pointer border-none bg-transparent outline-none"
              >
                <Copy className="size-4.5 text-muted-foreground" />
                Copy Text
              </button>

              <div className="flex flex-col gap-1 w-full px-4 py-3.5 text-xs text-muted-foreground bg-muted/5">
                <div className="flex items-center justify-between">
                  <span>Sent:</span>
                  <span className="font-semibold text-foreground">{activeTouchMessage.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className="font-semibold text-foreground">
                    {activeTouchMessage.seen ? "Seen" : "Sent"}
                    {activeTouchMessage.edited && " (Edited)"}
                  </span>
                </div>
              </div>
            </div>

            <Button variant="outline" onClick={() => setShowTouchSheet(false)} className="w-full text-xs h-10 rounded-xl font-medium">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
