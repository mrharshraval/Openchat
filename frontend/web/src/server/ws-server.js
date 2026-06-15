import { WebSocketServer } from "ws"

const PORT = 3001
const wss = new WebSocketServer({ port: PORT })

console.log(`[WS] WebSocket server starting on port ${PORT}...`)

let waitingQueue = []
let activeSessions = {} // sessionId -> { users: [u1, u2], sockets: { u1: ws, u2: ws }, messages: [] }

function removeUser(userId) {
  waitingQueue = waitingQueue.filter((u) => u.userId !== userId)
  
  // Clean up existing sessions
  for (const sessionId in activeSessions) {
    const session = activeSessions[sessionId]
    if (session.users.includes(userId)) {
      delete session.sockets[userId]
      // Notify partner
      const partnerId = session.users.find((id) => id !== userId)
      if (partnerId && session.sockets[partnerId]) {
        session.sockets[partnerId].send(
          JSON.stringify({
            type: "partner-disconnected",
            payload: { partnerId: userId },
          })
        )
      }
      if (Object.keys(session.sockets).length === 0) {
        delete activeSessions[sessionId]
      }
    }
  }
}

wss.on("connection", (ws) => {
  console.log("[WS] Client connected")

  ws.on("message", (rawMessage) => {
    try {
      const data = JSON.parse(rawMessage)
      const { type, payload } = data
      
      switch (type) {
        case "join-queue": {
          const { userId, interests, lang, country } = payload
          console.log(`[WS] User ${userId} joining queue. Lang: ${lang}, Region: ${country}, Interests: ${interests}`)
          
          removeUser(userId)

          // Try to match
          let bestCandidate = null
          let bestScore = -1

          for (const peer of waitingQueue) {
            if (peer.userId === userId) continue
            if (peer.lang !== lang) continue

            let score = 0
            if (country !== "global" && peer.country !== "global") {
              if (country === peer.country) {
                score += 10
              } else {
                continue
              }
            } else {
              score += 5
            }

            const sharedInterests = interests.filter((i) => peer.interests.includes(i))
            if (interests.length > 0 || peer.interests.length > 0) {
              if (sharedInterests.length > 0) {
                score += sharedInterests.length * 20
              }
            } else {
              score += 10
            }

            if (score > bestScore) {
              bestScore = score
              bestCandidate = peer
            }
          }

          if (bestCandidate) {
            waitingQueue = waitingQueue.filter((u) => u.userId !== bestCandidate.userId)
            const sessionId = `session-${Math.random().toString(36).slice(2, 11)}`

            activeSessions[sessionId] = {
              users: [userId, bestCandidate.userId],
              sockets: {
                [userId]: ws,
                [bestCandidate.userId]: bestCandidate.ws,
              },
              messages: [],
            }

            ws.send(JSON.stringify({ type: "match-found", payload: { sessionId, peerId: bestCandidate.userId } }))
            bestCandidate.ws.send(JSON.stringify({ type: "match-found", payload: { sessionId, peerId: userId } }))
            console.log(`[WS] Match found: Session ${sessionId} between ${userId} and ${bestCandidate.userId}`)
          } else {
            waitingQueue.push({ userId, ws, interests, lang, country })
            ws.send(JSON.stringify({ type: "waiting", payload: {} }))
          }
          break
        }

        case "cancel-queue": {
          const { userId } = payload
          console.log(`[WS] User ${userId} cancelled matching`)
          removeUser(userId)
          break
        }

        case "join-chat": {
          const { userId, sessionId } = payload
          console.log(`[WS] User ${userId} joining chat session ${sessionId}`)

          if (!activeSessions[sessionId]) {
            activeSessions[sessionId] = {
              users: [userId],
              sockets: { [userId]: ws },
              messages: [],
            }
          } else {
            if (!activeSessions[sessionId].users.includes(userId)) {
              activeSessions[sessionId].users.push(userId)
            }
            activeSessions[sessionId].sockets[userId] = ws
          }

          const session = activeSessions[sessionId]
          ws.send(
            JSON.stringify({
              type: "chat-history",
              payload: {
                messages: session.messages,
                partnerJoined: session.users.length > 1,
              },
            })
          )

          const partnerId = session.users.find((id) => id !== userId)
          if (partnerId && session.sockets[partnerId]) {
            session.sockets[partnerId].send(
              JSON.stringify({
                type: "partner-joined",
                payload: { partnerId: userId },
              })
            )
          }
          break
        }

        case "read-messages": {
          const { userId, sessionId } = payload
          const session = activeSessions[sessionId]
          if (!session) return

          let updated = false
          session.messages.forEach((m) => {
            if (m.senderId !== userId && !m.seen) {
              m.seen = true
              updated = true
            }
          })

          if (updated) {
            const partnerId = session.users.find((id) => id !== userId)
            if (partnerId && session.sockets[partnerId]) {
              session.sockets[partnerId].send(
                JSON.stringify({
                  type: "partner-seen-messages",
                  payload: {},
                })
              )
            }
          }
          break
        }

        case "send-message": {
          const { userId, sessionId, content, replyTo } = payload
          const session = activeSessions[sessionId]
          if (!session) return

          const msg = {
            id: Date.now().toString(),
            senderId: userId,
            content,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            reactions: {}, // Map of emoji -> userIds[]
            seen: false, // Default to false; must be marked read by recipient focus
            replyTo: replyTo ? {
              id: replyTo.id,
              senderId: replyTo.senderId,
              content: replyTo.content
            } : undefined
          }

          session.messages.push(msg)

          // Broadcast to both session users
          session.users.forEach((uid) => {
            if (session.sockets[uid]) {
              session.sockets[uid].send(JSON.stringify({ type: "message", payload: msg }))
            }
          })
          break
        }

        case "edit-message": {
          const { userId, sessionId, messageId, newContent } = payload
          const session = activeSessions[sessionId]
          if (!session) return

          const msg = session.messages.find((m) => m.id === messageId)
          if (msg && msg.senderId === userId) {
            msg.content = newContent
            msg.edited = true

            // Broadcast edit update to both users
            session.users.forEach((uid) => {
              if (session.sockets[uid]) {
                session.sockets[uid].send(
                  JSON.stringify({
                    type: "message-edited",
                    payload: { messageId, content: newContent, edited: true },
                  })
                )
              }
            })
          }
          break
        }

        case "send-reaction": {
          const { userId, sessionId, messageId, emoji } = payload
          const session = activeSessions[sessionId]
          if (!session) return

          const msg = session.messages.find((m) => m.id === messageId)
          if (msg) {
            msg.reactions = msg.reactions || {}
            
            // Remove user from any other emoji reactions on this message
            for (const key in msg.reactions) {
              if (key !== emoji) {
                msg.reactions[key] = msg.reactions[key].filter((id) => id !== userId)
                if (msg.reactions[key].length === 0) {
                  delete msg.reactions[key]
                }
              }
            }

            // Toggle user on the selected emoji
            const list = msg.reactions[emoji] || []
            const exists = list.includes(userId)
            
            msg.reactions[emoji] = exists ? list.filter((id) => id !== userId) : [...list, userId]

            if (msg.reactions[emoji].length === 0) {
              delete msg.reactions[emoji]
            }

            // Broadcast reaction update
            session.users.forEach((uid) => {
              if (session.sockets[uid]) {
                session.sockets[uid].send(
                  JSON.stringify({
                    type: "reaction-update",
                    payload: { messageId, reactions: msg.reactions },
                  })
                )
              }
            })
          }
          break
        }

        case "typing-status": {
          const { userId, sessionId, isTyping } = payload
          const session = activeSessions[sessionId]
          if (!session) return

          const partnerId = session.users.find((id) => id !== userId)
          if (partnerId && session.sockets[partnerId]) {
            session.sockets[partnerId].send(
              JSON.stringify({
                type: "partner-typing",
                payload: { isTyping },
              })
            )
          }
          break
        }

        default:
          console.warn(`[WS] Unknown action type: ${type}`)
      }
    } catch (e) {
      console.error("[WS] Error parsing incoming websocket message:", e)
    }
  })

  ws.on("close", () => {
    console.log("[WS] Client disconnected")
    
    // Scan all queues/sessions to remove this socket connection
    waitingQueue = waitingQueue.filter((u) => u.ws !== ws)

    for (const sessionId in activeSessions) {
      const session = activeSessions[sessionId]
      for (const userId in session.sockets) {
        if (session.sockets[userId] === ws) {
          delete session.sockets[userId]
          // Notify partner
          const partnerId = session.users.find((id) => id !== userId)
          if (partnerId && session.sockets[partnerId]) {
            session.sockets[partnerId].send(
              JSON.stringify({
                type: "partner-disconnected",
                payload: { partnerId: userId },
              })
            )
          }
        }
      }
      if (Object.keys(session.sockets).length === 0) {
        delete activeSessions[sessionId]
      }
    }
  })
})

console.log(`[WS] WebSocket server is running on ws://localhost:${PORT}`)
