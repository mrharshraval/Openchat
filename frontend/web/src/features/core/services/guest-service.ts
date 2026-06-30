import { getOrInitializeNickname } from "@/lib/nickname"

export class GuestService {
  static getGuestNickname(): string {
    return getOrInitializeNickname()
  }

  static getGuestUserId(): string {
    if (typeof window === "undefined") return "guest-ssr"
    let uId = sessionStorage.getItem("moots_userId")
    if (!uId) {
      uId = `user-${Math.random().toString(36).slice(2, 11)}`
      sessionStorage.setItem("moots_userId", uId)
    }
    return uId
  }
}
