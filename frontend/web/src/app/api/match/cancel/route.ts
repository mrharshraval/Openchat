import { NextResponse } from "next/server"
import { leaveQueue } from "@/lib/matchmaker"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    leaveQueue(userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error leaving queue:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
