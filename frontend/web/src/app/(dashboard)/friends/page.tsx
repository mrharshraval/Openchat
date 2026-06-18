"use client"

import * as React from "react"
import { Search, UserPlus, MessageSquare, UserMinus, ShieldAlert, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Friend {
  id: string
  name: string
  status: "online" | "idle" | "offline"
  interests: string[]
  relationship: "friend" | "pending" | "blocked"
}

export default function FriendsPage() {
  const [friends, setFriends] = React.useState<Friend[]>([
    {
      id: "1",
      name: "Alex",
      status: "online",
      interests: ["gaming", "movies"],
      relationship: "friend",
    },
    {
      id: "2",
      name: "Sarah",
      status: "idle",
      interests: ["music", "art"],
      relationship: "friend",
    },
    {
      id: "3",
      name: "Jake",
      status: "offline",
      interests: ["technology", "gaming"],
      relationship: "friend",
    },
    {
      id: "4",
      name: "Emma Watson",
      status: "offline",
      interests: ["movies", "books"],
      relationship: "pending",
    },
    {
      id: "5",
      name: "ToxicTroll",
      status: "offline",
      interests: [],
      relationship: "blocked",
    },
  ])

  const [activeTab, setActiveTab] = React.useState<"online" | "all" | "pending" | "blocked">("online")
  const [searchQuery, setSearchQuery] = React.useState("")

  const handleAcceptRequest = (id: string) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === id ? { ...f, relationship: "friend", status: "online" } : f))
    )
  }

  const handleDeclineRequest = (id: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== id))
  }

  const handleRemoveFriend = (id: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== id))
  }

  const handleUnblock = (id: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== id))
  }

  const filteredFriends = friends.filter((f) => {
    // Search query filter
    if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Tab filter
    if (activeTab === "online") return f.relationship === "friend" && f.status !== "offline"
    if (activeTab === "all") return f.relationship === "friend"
    if (activeTab === "pending") return f.relationship === "pending"
    if (activeTab === "blocked") return f.relationship === "blocked"
    return true
  })

  return (
    <div className="flex-1 flex flex-col h-full bg-background p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        
        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Friends</h1>
            <p className="text-sm text-muted-foreground">Manage your connections and chat partners</p>
          </div>
          <Button size="sm" className="text-xs gap-1.5 font-semibold">
            <UserPlus className="h-4 w-4" /> Add Friend
          </Button>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {["online", "all", "pending", "blocked"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`text-xs font-semibold px-4 py-2.5 rounded-lg border transition-all capitalize ${
                  activeTab === tab
                    ? "bg-primary border-primary text-primary-foreground shadow-sm"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9.5 text-xs bg-card border-border focus:border-primary w-full"
            />
          </div>
        </div>

        {/* Friends List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFriends.length === 0 ? (
            <div className="col-span-full text-center py-16 border border-dashed border-border rounded-xl bg-card">
              <Search className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No friends found</p>
            </div>
          ) : (
            filteredFriends.map((friend) => (
              <Card key={friend.id} className="p-4 border border-border bg-card hover:bg-muted/5 transition-all">
                <div className="flex items-center gap-3.5">
                  
                  {/* User Avatar + Status Badge */}
                  <div className="relative">
                    <Avatar className="h-11 w-11 rounded-full">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {friend.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Status dot */}
                    {friend.relationship === "friend" && (
                      <span
                        className={`absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-card ${
                          friend.status === "online"
                            ? "bg-green-500"
                            : friend.status === "idle"
                            ? "bg-amber-500"
                            : "bg-muted-foreground/45"
                        }`}
                      />
                    )}
                  </div>

                  {/* Friend Information */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate">{friend.name}</h3>
                    
                    {/* Relationship/Status Description */}
                    {friend.relationship === "friend" ? (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {friend.interests.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 bg-muted rounded text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : friend.relationship === "pending" ? (
                      <p className="text-xs text-muted-foreground mt-0.5">Incoming friend request</p>
                    ) : (
                      <p className="text-xs text-red-500/90 mt-0.5 font-medium">Blocked</p>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center gap-1.5">
                    {friend.relationship === "friend" && (
                      <>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFriend(friend.id)}
                          className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {friend.relationship === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAcceptRequest(friend.id)}
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeclineRequest(friend.id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {friend.relationship === "blocked" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnblock(friend.id)}
                        className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                      >
                        <ShieldAlert className="h-4 w-4 mr-1" /> Unblock
                      </Button>
                    )}
                  </div>

                </div>
              </Card>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
