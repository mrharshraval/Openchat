import { create } from "zustand"

export type ConnectionStatus = "none" | "pending_sent" | "pending_received" | "accepted"

interface PartnerState {
  peerNickname: string
  peerUsername: string | null
  isStrangerDisconnected: boolean
  isTyping: boolean
  hasRevealedIdentity: boolean
  partnerRevealedIdentity: boolean
  connectionStatus: ConnectionStatus
  isWsReady: boolean

  setPeerIdentity: (nickname: string, username: string | null) => void
  setIsStrangerDisconnected: (val: boolean) => void
  setIsTyping: (val: boolean) => void
  setHasRevealedIdentity: (val: boolean) => void
  setPartnerRevealedIdentity: (val: boolean) => void
  setConnectionStatus: (val: ConnectionStatus) => void
  setIsWsReady: (val: boolean) => void
  reset: () => void
}

export const usePartnerStateStore = create<PartnerState>((set) => ({
  peerNickname: "Stranger",
  peerUsername: null,
  isStrangerDisconnected: false,
  isTyping: false,
  hasRevealedIdentity: false,
  partnerRevealedIdentity: false,
  connectionStatus: "none",
  isWsReady: false,

  setPeerIdentity: (peerNickname, peerUsername) => set({ peerNickname, peerUsername }),
  setIsStrangerDisconnected: (isStrangerDisconnected) => set({ isStrangerDisconnected }),
  setIsTyping: (isTyping) => set({ isTyping }),
  setHasRevealedIdentity: (hasRevealedIdentity) => set({ hasRevealedIdentity }),
  setPartnerRevealedIdentity: (partnerRevealedIdentity) => set({ partnerRevealedIdentity }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setIsWsReady: (isWsReady) => set({ isWsReady }),
  reset: () => set({
    peerNickname: "Stranger",
    peerUsername: null,
    isStrangerDisconnected: false,
    isTyping: false,
    hasRevealedIdentity: false,
    partnerRevealedIdentity: false,
    connectionStatus: "none",
    isWsReady: false,
  })
}))
