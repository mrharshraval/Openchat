import { NextResponse } from "next/server"
import { joinQueue } from "@/lib/matchmaker"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, interests, lang, country } = body

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const result = joinQueue({
      userId,
      interests: Array.isArray(interests) ? interests : [],
      lang: lang || "en",
      country: country || "global",
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error joining queue:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
