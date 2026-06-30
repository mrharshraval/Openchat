import { NextResponse } from "next/server"
import { env } from "@/env"
import { apiRequest } from "@/lib/api-client"
import { auth } from "@/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, interests, lang, country } = body

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const session = await auth()
    const accessToken = session ? (session as any).accessToken as string | null : null

    const backendUrl = env.BACKEND_API_URL
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`
    }

    const res = await apiRequest(`${backendUrl}/api/match`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        userId,
        interests: Array.isArray(interests) ? interests : [],
        lang: lang || "en",
        country: country || "global",
      }),
      actionName: "Proxy POST /api/match",
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Error proxying join queue:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
