import { NextResponse } from "next/server"
import { env } from "@/env"
import { apiRequest } from "@/lib/api-client"
import { auth } from "@/auth"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  }

  try {
    const session = await auth()
    const accessToken = session ? (session as any).accessToken as string | null : null

    const backendUrl = env.BACKEND_API_URL
    const headers: Record<string, string> = {}
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`
    }

    const res = await apiRequest(`${backendUrl}/api/match/status?userId=${userId}`, {
      method: "GET",
      headers,
      actionName: "Proxy GET /api/match/status",
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Error proxying match status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
