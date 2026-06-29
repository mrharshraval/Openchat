import { registry, ConnectionMetadata } from "../registry/registry.js";
import { matchmakingService } from "../matchmaking/matchmaking.js";
import { sessionService } from "../rooms/session.js";
import { structuredLog } from "../../lib/logger.js";
import { redis } from "../../lib/redis.js";
import crypto from "crypto";

export async function handleParsedMessage(
  connectionId: string, 
  type: string, 
  payload: any, 
  conn: ConnectionMetadata,
  requestId: string
) {
  const actorId = conn.actorId;
  const sessionId = ("sessionId" in payload && payload.sessionId) ? payload.sessionId : "N/A";

  if (!actorId) return;

  switch (type) {
    case "join-queue": {
      const { interests, lang, country, nickname, username } = payload;
      
      registry.updateMetadata(connectionId, {
        actorId,
        email: conn.email,
        sessionId: conn.sessionId,
        requestId: conn.requestId,
        connectionType: "queue",
      });

      await matchmakingService.removeUser(actorId);
      await matchmakingService.addUser(actorId, { interests, lang, country, nickname, username }, connectionId);

      const match = await matchmakingService.findMatch(actorId);
      if (match) {
        // ADR-011: API Owns Durable State. 
        // We do NOT generate a sessionId here, and we do NOT broadcast match-found yet.
        // We push a command to provision the conversation and wait for the API event.
        
        redis.lpush("moots:command:provision_conversation", JSON.stringify({
          actorId1: actorId,
          actorId2: match.actorId,
          policyId: "policy_anon_stranger_v1",
          metadata: {
            actor1: { nickname, username, connectionId },
            actor2: { nickname: match.nickname, username: match.username, connectionId: match.connectionId }
          }
        })).catch((err: any) => {
          structuredLog("REDIS_COMMAND_QUEUE_ERROR", connectionId, { details: err.message }, "error", conn);
        });

        // We just wait. The client is still in the "queue" state.
      }
      break;
    }

    case "cancel-queue": {
      await matchmakingService.removeUser(actorId);
      break;
    }

    case "join-chat": {
      const { nickname, username, sessionId } = payload;
      registry.updateMetadata(connectionId, {
        sessionId,
        connectionType: "chat",
      });

      const session = await sessionService.joinSession(
        sessionId,
        actorId,
        connectionId,
        registry,
        (partnerWs, joinedUserId) => {
          partnerWs.send(
            JSON.stringify({
              type: "partner-joined",
              payload: {
                partnerId: joinedUserId,
                partnerNickname: nickname || "Stranger",
                partnerUsername: username || null,
              },
            })
          );
        }
      );

      if (session) {
        if (!session.nicknames) session.nicknames = {};
        if (!session.usernames) session.usernames = {};
        if (nickname) session.nicknames[actorId] = nickname;
        if (username) session.usernames[actorId] = username;

        const partnerId = session.users.find((id) => id !== actorId);
        const partnerNickname = partnerId ? (session.nicknames ? session.nicknames[partnerId] : "Stranger") : "Stranger";
        const partnerUsername = partnerId ? (session.usernames ? session.usernames[partnerId] : null) : null;
        conn.ws.send(
          JSON.stringify({
            type: "chat-history",
            payload: {
              messages: session.messages,
              partnerJoined: partnerId ? session.activeConnections.has(partnerId) : false,
              partnerNickname: partnerNickname || "Stranger",
              partnerUsername: partnerUsername || null,
            },
          })
        );
      }
      break;
    }

    case "read-messages": {
      const { sessionId } = payload;
      redis.lpush("moots:command:mark_read", JSON.stringify({ conversationId: sessionId, actorId })).catch((err: any) => {
        structuredLog("REDIS_COMMAND_QUEUE_ERROR", connectionId, { details: err.message }, "error", conn);
      });
      break;
    }

    case "send-message": {
      const { sessionId, content, replyTo } = payload;
      redis.lpush("moots:command:send_message", JSON.stringify({
        conversationId: sessionId,
        senderParticipantId: actorId,
        content,
        clientMessageId: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 11),
        replyToId: replyTo?.id,
      })).catch((err: any) => {
        structuredLog("REDIS_COMMAND_QUEUE_ERROR", connectionId, { details: err.message }, "error", conn);
      });
      break;
    }

    case "edit-message": {
      const { sessionId, messageId, newContent } = payload;
      redis.lpush("moots:command:edit_message", JSON.stringify({
        messageId,
        newContent,
      })).catch((err: any) => {
        structuredLog("REDIS_COMMAND_QUEUE_ERROR", connectionId, { details: err.message }, "error", conn);
      });
      break;
    }

    case "send-reaction": {
      const { sessionId, messageId, emoji } = payload;
      redis.lpush("moots:command:send_reaction", JSON.stringify({
        messageId,
        emoji,
        actorId,
      })).catch((err: any) => {
        structuredLog("REDIS_COMMAND_QUEUE_ERROR", connectionId, { details: err.message }, "error", conn);
      });
      break;
    }

    case "typing-status": {
      const { sessionId, isTyping } = payload;
      const session = sessionService.getSession(sessionId);
      if (!session) return;

      const partnerId = session.users.find((id) => id !== actorId);
      if (partnerId) {
        const partnerConnId = session.activeConnections.get(partnerId);
        if (partnerConnId) {
          const partnerConn = registry.get(partnerConnId);
          if (partnerConn && partnerConn.ws) {
            partnerConn.ws.send(
              JSON.stringify({
                type: "partner-typing",
                payload: { isTyping },
              })
            );
          }
        }
      }
      break;
    }

    case "connection:request": {
      const { sessionId } = payload;
      const session = sessionService.getSession(sessionId);
      if (!session) return;

      const partnerId = session.users.find((id) => id !== actorId);
      if (partnerId) {
        redis.lpush("moots:command:connection_request", JSON.stringify({
          actorId1: actorId,
          actorId2: partnerId,
        })).catch((err: any) => {
          structuredLog("REDIS_COMMAND_QUEUE_ERROR", connectionId, { details: err.message }, "error", conn);
        });
      }
      break;
    }

    case "connection:accepted": {
      const { sessionId } = payload;
      const session = sessionService.getSession(sessionId);
      if (!session) return;

      const partnerId = session.users.find((id) => id !== actorId);
      if (partnerId) {
        redis.lpush("moots:command:connection_accept", JSON.stringify({
          actorId,
          id: partnerId,
        })).catch((err: any) => {
          structuredLog("REDIS_COMMAND_QUEUE_ERROR", connectionId, { details: err.message }, "error", conn);
        });
      }
      break;
    }

    case "connection:removed": {
      const { sessionId } = payload;
      const session = sessionService.getSession(sessionId);
      if (!session) return;

      const partnerId = session.users.find((id) => id !== actorId);
      if (partnerId) {
        redis.lpush("moots:command:connection_remove", JSON.stringify({
          actorId,
          id: partnerId,
        })).catch((err: any) => {
          structuredLog("REDIS_COMMAND_QUEUE_ERROR", connectionId, { details: err.message }, "error", conn);
        });
      }
      break;
    }

    case "participant:identity-revealed": {
      const { sessionId } = payload;
      redis.lpush("moots:command:identity_reveal", JSON.stringify({
        id: sessionId,
        actorId,
      })).catch((err: any) => {
        structuredLog("REDIS_COMMAND_QUEUE_ERROR", connectionId, { details: err.message }, "error", conn);
      });
      break;
    }

    case "participant:identity-hidden": {
      const { sessionId } = payload;
      sessionService.broadcast(sessionId, { type, payload }, registry, [actorId]);
      break;
    }
  }
}
