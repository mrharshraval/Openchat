"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/shared/ui/dialog"
import { useMatchmakingFlow } from "../../application/use-matchmaking-flow"
import { InterestSelector, POPULAR_TOPICS } from "./interest-selector"

export function MatchmakerDialog() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status, seconds, interests, setInterests, startMatchmaking, cancelMatchmaking } = useMatchmakingFlow()
  const [customTopics, setCustomTopics] = React.useState<string[]>([])

  const startMatchingFlag = searchParams.get("startMatching")

  // Auto-start if parameter is present
  React.useEffect(() => {
    if (startMatchingFlag === "true" && status === "idle") {
      startMatchmaking()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startMatchingFlag, status])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.push("/")
    }
  }

  const handleToggleTopic = (topicId: string) => {
    if (interests.includes(topicId)) {
      setInterests(interests.filter((t: string) => t !== topicId))
    } else {
      setInterests([...interests, topicId])
    }
  }

  const handleAddCustom = (topicId: string) => {
    if (!interests.includes(topicId)) {
      setInterests([...interests, topicId])
      setCustomTopics([...customTopics, topicId])
    }
  }

  const formatInterestsString = () => {
    if (interests.length === 0) return "Random vibe"
    return interests
      .map((tag: string) => {
        const predefined = POPULAR_TOPICS.find((t: any) => t.id === tag)
        return predefined ? predefined.label : tag.charAt(0).toUpperCase() + tag.slice(1)
      })
      .join(" • ")
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-background">
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogContent showCloseButton={false} className="flex! flex-col! p-6! gap-4! max-w-[400px] sm:max-w-[400px]! w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] rounded-3xl bg-background border border-border select-none shadow-lg">
          
          {status === "idle" && (
            <>
              <DialogHeader className="text-left items-start">
                <DialogTitle className="text-lg font-bold tracking-tight text-foreground">Discover People</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  Choose a few topics to improve your matches.
                </DialogDescription>
              </DialogHeader>

              <InterestSelector
                selected={interests}
                customTopics={customTopics}
                onToggle={handleToggleTopic}
                onAddCustom={handleAddCustom}
              />

              <div className="flex justify-end gap-2.5 mt-1">
                <DialogClose asChild>
                  <Button variant="ghost" className="text-xs h-9.5 rounded-md font-medium text-muted-foreground hover:text-foreground px-4 cursor-pointer">
                    Cancel
                  </Button>
                </DialogClose>
                <Button onClick={() => startMatchmaking()} className="text-xs h-9.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/95 font-medium px-4 cursor-pointer shadow-sm">
                  Find a Match
                </Button>
              </div>
            </>
          )}

          {status === "searching" && (
            <>
              <DialogHeader className="text-left items-start">
                <DialogTitle className="text-lg font-bold tracking-tight text-foreground transition-all duration-300">
                  {seconds < 15 ? "Finding someone interesting..." : "Still searching for a great match..."}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1 transition-all duration-300">
                  {seconds < 15 
                    ? "We're looking for a compatible conversation partner." 
                    : "This is taking a little longer than usual."}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-2 animate-in fade-in duration-300">
                <div className="w-full h-0.5 bg-muted rounded-full relative overflow-hidden my-2">
                  <div className="animate-progress-slide rounded-full" />
                </div>
                
                <div className="text-xs text-muted-foreground/80 font-medium select-none text-center leading-normal">
                  {formatInterestsString()}
                </div>

                <div className="text-[11px] text-muted-foreground/50 text-center select-none font-medium mt-1">
                  Usually takes less than 10 seconds
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-1">
                <Button
                  onClick={cancelMatchmaking}
                  className="text-xs h-9.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/95 font-medium px-4 cursor-pointer shadow-sm"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}

          {status === "found" && (
            <>
              <DialogHeader className="text-left items-start">
                <DialogTitle className="text-lg font-bold tracking-tight text-foreground">✨ Match Found</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  Shared interests: {formatInterestsString()}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-4 justify-center items-center animate-in zoom-in-95 duration-200">
                <span className="text-xs text-muted-foreground font-medium select-none animate-pulse">
                  Opening conversation...
                </span>
              </div>
            </>
          )}

        </DialogContent>
      </Dialog>
    </div>
  )
}
