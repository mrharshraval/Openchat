import * as React from "react"
import { CornerUpLeft, Edit3, Copy } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { cn } from "@/shared/utils/utils"

export interface TouchContextSheetProps {
  activeMessage: any
  userId: string
  handleReact: (msgId: string, emoji: string) => void
  setReplyingTo: (msg: any) => void
  setEditingMsg: (msg: any) => void
  setInputText: (text: string) => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onClose: () => void
}

export function TouchContextSheet({
  activeMessage,
  userId,
  handleReact,
  setReplyingTo,
  setEditingMsg,
  setInputText,
  textareaRef,
  onClose
}: TouchContextSheetProps) {
  if (!activeMessage) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-end justify-center animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-full max-w-md bg-card border-t border-border rounded-t-2xl p-5 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-2" />
        
        {/* Quick Reactions */}
        <div className="flex items-center justify-between gap-1 bg-muted/30 p-2 rounded-xl border border-border/40">
          {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => {
            const isReacted = activeMessage.reactions?.[emoji]?.includes(userId)
            return (
              <button
                key={emoji}
                onClick={() => {
                  handleReact(activeMessage.id, emoji)
                  onClose()
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
              setReplyingTo(activeMessage)
              setEditingMsg(null)
              onClose()
              if (textareaRef.current) textareaRef.current.focus()
            }}
            className="flex items-center gap-3 w-full px-4 py-3.5 text-left text-sm font-medium text-foreground hover:bg-muted/40 transition-colors cursor-pointer border-none bg-transparent outline-none"
          >
            <CornerUpLeft className="size-4.5 text-muted-foreground" />
            Reply
          </button>

          {activeMessage.sender === "user" && (
            <button
              onClick={() => {
                setEditingMsg(activeMessage)
                setReplyingTo(null)
                setInputText(activeMessage.content)
                onClose()
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
              navigator.clipboard.writeText(activeMessage.content)
              onClose()
            }}
            className="flex items-center gap-3 w-full px-4 py-3.5 text-left text-sm font-medium text-foreground hover:bg-muted/40 transition-colors cursor-pointer border-none bg-transparent outline-none"
          >
            <Copy className="size-4.5 text-muted-foreground" />
            Copy Text
          </button>

          <div className="flex flex-col gap-1 w-full px-4 py-3.5 text-xs text-muted-foreground bg-muted/5">
            <div className="flex items-center justify-between">
              <span>Sent:</span>
              <span className="font-semibold text-foreground">{activeMessage.time}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <span className="font-semibold text-foreground">
                {activeMessage.seen ? "Seen" : "Sent"}
                {activeMessage.edited && " (Edited)"}
              </span>
            </div>
          </div>
        </div>

        <Button variant="outline" onClick={onClose} className="w-full text-xs h-10 rounded-xl font-medium">
          Cancel
        </Button>
      </div>
    </div>
  )
}
