import { useState } from "react"
import { Plus } from "lucide-react"
import { Input } from "@/shared/ui/input"

export const POPULAR_TOPICS = [
  { id: "gaming", label: "Gaming" },
  { id: "movies", label: "Movies" },
  { id: "music", label: "Music" },
  { id: "sports", label: "Sports" },
  { id: "technology", label: "Technology" },
  { id: "travel", label: "Travel" },
  { id: "food", label: "Food" },
  { id: "books", label: "Books" },
  { id: "art", label: "Art" },
]

interface InterestSelectorProps {
  selected: string[]
  customTopics: string[]
  onToggle: (topicId: string) => void
  onAddCustom: (topicId: string) => void
}

export function InterestSelector({ selected, customTopics, onToggle, onAddCustom }: InterestSelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customInput, setCustomInput] = useState("")

  const allTopics = [
    ...POPULAR_TOPICS,
    ...customTopics.map((topic) => ({
      id: topic,
      label: topic.charAt(0).toUpperCase() + topic.slice(1),
    })),
  ]

  const handleCustomSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const cleanTag = customInput.trim().toLowerCase().replace(/[^a-z0-9]/g, "")
    if (cleanTag && !selected.includes(cleanTag)) {
      onAddCustom(cleanTag)
    }
    setCustomInput("")
    setShowCustomInput(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCustomSubmit()
    } else if (e.key === "Escape") {
      setCustomInput("")
      setShowCustomInput(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {allTopics.map((topic) => {
          const isSelected = selected.includes(topic.id)
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => onToggle(topic.id)}
              className={`text-xs h-9 px-4 rounded-[10px] font-medium border flex items-center justify-center transition-colors cursor-pointer ${
                isSelected
                  ? "bg-primary border-primary text-primary-foreground hover:bg-primary/95"
                  : "bg-muted/20 border-border/80 text-foreground hover:text-foreground hover:bg-muted/50 hover:border-muted-foreground/30"
              }`}
            >
              {topic.label}
            </button>
          )
        })}
      </div>

      <div className="flex items-center min-h-[26px]">
        {showCustomInput ? (
          <div className="w-full max-w-[200px] animate-in fade-in duration-200">
            <Input
              autoFocus
              placeholder="Type custom topic..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleCustomSubmit}
              className="text-xs h-8.5 bg-background border-border w-full"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCustomInput(true)}
            className="text-xs text-muted-foreground/80 hover:text-foreground inline-flex items-center gap-1.5 transition-colors cursor-pointer font-medium py-0.5 p-0 border-0 bg-transparent"
          >
            <Plus className="h-4 w-4" strokeWidth={2} /> Add custom topic
          </button>
        )}
      </div>
    </div>
  )
}
