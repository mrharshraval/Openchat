import { env } from "../env";

/**
 * Fetches the backend JWT access token from the secure server route.
 * Used by client-side code to authenticate WebSocket connections.
 *
 * If the user is not authenticated via NextAuth, it attempts to fetch
 * or reuse a guest token from the backend API.
 */

function isTokenExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Consider expired if within 60 seconds of expiration
    return payload.exp * 1000 < Date.now() + 60000;
  } catch (e) {
    return true;
  }
}

async function refreshBackendToken(): Promise<string | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include", // Sends HttpOnly actor_session_token cookie
    });
    if (res.ok) {
      const data = await res.json();
      const token = data.data?.accessToken;
      if (token) {
        localStorage.setItem("moots_guest_token", token);
        return token;
      }
    }
  } catch (e) {}
  return null;
}

export async function getWsAccessToken(): Promise<string | null> {
  try {
    let token = null;

    const res = await fetch("/api/auth/token");
    if (res.ok) {
      const data = await res.json();
      if (data.accessToken) {
        token = data.accessToken;
      }
    }

    if (!token) {
      // Fallback: Guest authentication token
      token = localStorage.getItem("moots_guest_token");
    }

    // If we have a token and it's valid, return it
    if (token && !isTokenExpired(token)) {
      return token;
    }

    // Token is expired or missing. Try refreshing using the Universal Session Platform cookie
    token = await refreshBackendToken();
    if (token) return token;

    // If refresh failed (no cookie or invalid cookie), provision a new guest session
    const guestRes = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/auth/guest`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Ensures the new HttpOnly cookie is saved in the browser
    });
    
    if (guestRes.ok) {
      const guestData = await guestRes.json();
      token = guestData.data?.accessToken;
      if (token) {
        localStorage.setItem("moots_guest_token", token);
        return token;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}
