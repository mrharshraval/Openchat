import * as React from "react"
import { Button } from "@/shared/ui/button"

export interface SessionDisconnectedProps {
  isEngaged: boolean
  peerDisplayName: string
  onFindMatch: () => void
  onChangeInterests: () => void
}

export function SessionDisconnected({
  isEngaged,
  peerDisplayName,
  onFindMatch,
  onChangeInterests
}: SessionDisconnectedProps) {
  if (isEngaged) {
    return (
      <div className="mt-8 border-t border-border/40 pt-8 pb-4 w-full">
        <div className="flex flex-col items-center text-center gap-4 max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex flex-col items-center gap-1.5">
            <h3 className="text-md font-bold tracking-tight text-foreground">Conversation Ended</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              {peerDisplayName} left.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 w-full mt-2">
            <Button onClick={onFindMatch} className="w-full text-xs h-9.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/95 font-medium px-4 cursor-pointer shadow-sm">
              Find Another Match
            </Button>
            <button type="button" onClick={onChangeInterests} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-medium py-1.5 bg-transparent border-0">
              Change Interests
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background text-foreground max-w-md mx-auto w-full">
      <div className="flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center gap-1.5">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Match Left</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            They left before the conversation started.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 w-full mt-1">
          <Button onClick={onFindMatch} className="w-full text-xs h-9.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/95 font-medium px-4 cursor-pointer shadow-sm">
            Find Another Match
          </Button>
          <button type="button" onClick={onChangeInterests} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-medium py-1.5 bg-transparent border-0">
            Change Interests
          </button>
        </div>
      </div>
    </div>
  )
}
