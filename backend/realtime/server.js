import { WebSocketServer } from "ws";
import { createServer } from "http";
import { parse } from "url";
import crypto from "crypto";
import { PORT, ALLOWED_ORIGINS, STALE_CLEANUP_INTERVAL } from "./src/config.js";
import { env } from "./src/env.js";
import { registry } from "./src/registry.js";
import { matchmakingService } from "./src/matchmaking.js";
import { sessionService } from "./src/session.js";
import { messagingService, structuredLog } from "./src/messaging.js";
import { logger } from "./src/lib/logger.js";

// Initialize a unified HTTP Server to handle /health endpoint
const server = createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  if (parsedUrl.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "healthy",
        service: "moots-realtime",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        clientsCount: wss.clients.size,
      })
    );
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Initialize the WebSocket Server (without port, bound to unified HTTP server upgrades)
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

wss.on("connection", (ws, req) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const origin = req.headers.origin;
  
  // Extract Request ID from handshake query parameters
  const parsedUrl = parse(req.url, true);
  const requestId = parsedUrl.query.requestId || `req-ws-${crypto.randomUUID()}`;

  // 1. Origin Verification (Security Standard to prevent Cross-Site WebSocket Hijacking - CSWSH)
  if (env.NODE_ENV === "production") {
    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
      structuredLog("CONNECTION_REJECTED", "SYSTEM", {
        details: `Unauthorized origin: ${origin || "None"} (IP: ${clientIp})`,
      }, "warn");
      ws.close(1008, "Unauthorized Origin");
      return;
    }
  }

  // 2. Register Connection with Request ID
  const conn = registry.register(ws, requestId);

  structuredLog("CONNECTION_OPENED", conn.connectionId, {
    details: `IP: ${clientIp} | Origin: ${origin || "None"}`,
  });

  // 3. Heartbeat setup
  ws.on("pong", () => {
    registry.heartbeat(conn.connectionId);
  });

  // 4. Inbound Message Handling
  ws.on("message", (rawMessage) => {
    messagingService.handleMessage(conn.connectionId, rawMessage);
  });

  // 5. Connection Close Handling
  ws.on("close", () => {
    structuredLog("CONNECTION_CLOSED", conn.connectionId, {
      userId: conn.userId || undefined,
      sessionId: conn.sessionId || undefined,
      details: `Type: ${conn.connectionType || "unidentified"}`,
    });

    if (conn.connectionType === "queue" && conn.userId) {
      matchmakingService.removeUser(conn.userId);
    }

    if (conn.userId) {
      sessionService.handleDisconnect(
        conn.connectionId,
        registry,
        // Callback to notify partner when grace period actually expires
        (partnerWs, disconnectedUserId) => {
          partnerWs.send(
            JSON.stringify({
              type: "partner-disconnected",
              payload: { partnerId: disconnectedUserId },
            })
          );
        }
      );
    }

    registry.deregister(conn.connectionId);
  });

  // 6. Error handling
  ws.on("error", (error) => {
    structuredLog("CONNECTION_ERROR", conn.connectionId, {
      details: error.message,
    }, "error");
  });
});

// Start active heartbeat monitor (pings clients)
registry.startHeartbeatMonitor(wss, (conn) => {
  structuredLog("HEARTBEAT_TIMEOUT", conn.connectionId, {
    userId: conn.userId || undefined,
    sessionId: conn.sessionId || undefined,
  }, "warn");

  if (conn.connectionType === "queue" && conn.userId) {
    matchmakingService.removeUser(conn.userId);
  }

  if (conn.userId) {
    sessionService.handleDisconnect(
      conn.connectionId,
      registry,
      (partnerWs, disconnectedUserId) => {
        partnerWs.send(
          JSON.stringify({
            type: "partner-disconnected",
            payload: { partnerId: disconnectedUserId },
          })
        );
      }
    );
  }
});

// Periodic background job for general stale resources cleanup
const cleanupJob = setInterval(() => {
  const isConnectionActive = (connectionId) => registry.get(connectionId) !== undefined;
  
  matchmakingService.cleanupStaleQueueEntries(isConnectionActive);
  sessionService.cleanupStaleSessions();
  
  structuredLog("CLEANUP_JOB", "SYSTEM", {
    details: `Stats - Clients: ${wss.clients.size} | Active Queued: ${matchmakingService.getQueueSize()} | Active Sessions: ${sessionService.getSessionsCount()}`
  });
}, STALE_CLEANUP_INTERVAL);

wss.on("close", () => {
  registry.stopHeartbeatMonitor();
  clearInterval(cleanupJob);
});

wss.on("error", (error) => {
  structuredLog("SERVER_ERROR", "SYSTEM", { details: error.message }, "error");
});

// Graceful shutdown on process termination signals (SIGTERM, SIGINT)
const shutdown = (signal) => {
  structuredLog("SHUTDOWN_SIGNAL", "SYSTEM", { details: `Received ${signal}. Closing server gracefully...` }, "warn");

  // Close all active connections
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.close(1001, "Server is shutting down");
    }
  });

  wss.close(() => {
    structuredLog("SERVER_SHUTDOWN", "SYSTEM", { details: 'Server closed. Exiting process.' }, "warn");
    process.exit(0);
  });

  // Force exit after 5 seconds
  setTimeout(() => {
    structuredLog("FORCE_EXIT", "SYSTEM", { details: 'Force exiting after timeout.' }, "error");
    process.exit(1);
  }, 5000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Startup Validation Check
async function validateStartup() {
  logger.info("Running startup checks and diagnostics...");
  logger.info("Configuration summary:", {
    service: "moots-realtime",
    version: "1.0.0",
    environment: env.NODE_ENV,
    port: PORT,
  });
}

validateStartup().then(() => {
  server.listen(PORT, () => {
    logger.info(`WebSocket and Health HTTP Server listening on port ${PORT}`);
  });
});
