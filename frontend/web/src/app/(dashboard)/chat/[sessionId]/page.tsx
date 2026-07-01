"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { ChatSession } from "@/features/chat"

export default function ChatSessionPage() {
  const params = useParams()
  const sessionId = params?.sessionId as string

  return <ChatSession sessionId={sessionId} />
}

