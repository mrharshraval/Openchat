import { WebSocketServer, WebSocket } from "ws";
import { createServer, IncomingMessage } from "http";
import { parse } from "url";
import crypto from "crypto";
import { PORT, ALLOWED_ORIGINS, STALE_CLEANUP_INTERVAL } from "./config.js";
import { env } from "./env.js";
import { structuredLog, logger } from "./lib/logger.js";
import { metricsRegistry } from "./lib/metrics.js";
import { initializeEventListener } from "./modules/events/event.subscriber.js";
import { initializeWebSocketGateway } from "./modules/gateways/ws.gateway.js";

// Initialize a unified HTTP Server to handle /health and /metrics endpoint
const server = createServer(async (req, res) => {
  if (!req.url) return;
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
  } else if (parsedUrl.pathname === "/metrics") {
    try {
      res.writeHead(200, { "Content-Type": metricsRegistry.contentType });
      res.end(await metricsRegistry.metrics());
    } catch (ex) {
      res.writeHead(500);
      res.end();
    }
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Initialize the WebSocket Server (without port, bound to unified HTTP server upgrades)
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req: IncomingMessage, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
    wss.emit("connection", ws, req);
  });
});

initializeWebSocketGateway(wss);

// Graceful shutdown on process termination signals (SIGTERM, SIGINT)
const shutdown = (signal: string) => {
  structuredLog("SHUTDOWN_SIGNAL", "SYSTEM", { details: `Received ${signal}. Closing server gracefully...` }, "warn");

  // Close all active connections
  wss.clients.forEach((client: WebSocket) => {
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
  logger.info({
    service: "moots-realtime",
    version: "1.0.0",
    environment: env.NODE_ENV,
    port: PORT,
  }, "Configuration summary:");
}

validateStartup().then(() => {
  initializeEventListener();
  server.listen(PORT, () => {
    logger.info(`WebSocket and Health HTTP Server listening on port ${PORT}`);
  });
});
