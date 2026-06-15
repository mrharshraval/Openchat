import { NextResponse } from "next/server"
import { checkStatus } from "@/lib/matchmaker"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  }

  const result = checkStatus(userId)
  return NextResponse.json(result)
}
