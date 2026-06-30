import * as React from "react"
import { useChatStore } from "@/stores/chat-store"
import { ChatService } from "@/services/chat-service"

export function useSecondaryNav(userId: string) {
  const filter = useChatStore((state) => state.filter)
  const setFilter = useChatStore((state) => state.setFilter)
  const searchQuery = useChatStore((state) => state.searchQuery)
  const setSearchQuery = useChatStore((state) => state.setSearchQuery)
  const conversations = useChatStore((state) => state.conversations)
  const isLoading = useChatStore((state) => state.isLoading)
  const hasMore = useChatStore((state) => state.hasMore)
  const nextCursor = useChatStore((state) => state.nextCursor)

  const observerRef = React.useRef<IntersectionObserver | null>(null)
  const loadMoreRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    ChatService.fetchConversations()
  }, [])

  React.useEffect(() => {
    if (isLoading || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor) {
          ChatService.fetchConversations(nextCursor)
        }
      },
      { threshold: 1.0 }
    )

    if (loadMoreRef.current) observer.observe(loadMoreRef.current)
    observerRef.current = observer

    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [isLoading, hasMore, nextCursor])

  const filteredConversations = React.useMemo(() => {
    let filtered = conversations || []
    
    if (filter === "archived") {
      filtered = filtered.filter(c => c.isArchived)
    } else if (filter === "requests") {
      filtered = []
    } else {
      filtered = filtered.filter(c => !c.isArchived)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(c => 
        c.name?.toLowerCase().includes(q) || 
        c.participants.some(p => p.name?.toLowerCase().includes(q) || p.username?.toLowerCase().includes(q)) ||
        c.lastMessagePreview?.toLowerCase().includes(q)
      )
    }

    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      
      const timeA = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
      const timeB = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
      return timeB - timeA
    })
  }, [conversations, filter, searchQuery])

  return {
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    isLoading,
    filteredConversations,
    loadMoreRef,
    hasMore
  }
}
