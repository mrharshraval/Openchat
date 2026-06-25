import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { env } from "@/env";
import { apiRequest } from "@/lib/api-client";

export async function PUT(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, name, bio, image } = await req.json();
    const requestId = req.headers.get("x-request-id") || "";

    const backendUrl = env.BACKEND_API_URL;
    const res = await apiRequest(`${backendUrl}/api/user/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Request-ID": requestId,
      },
      body: JSON.stringify({
        userId: session.user.id,
        username,
        name,
        bio,
        image,
      }),
      actionName: "Proxy PUT /api/user/settings",
      userId: session.user.id,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Settings proxy error:", error);
    return NextResponse.json(
      { error: "Backend API is unreachable" },
      { status: 500 }
    );
  }
}
