import { env } from "../env.js";

const isProduction = env.NODE_ENV === "production";

class RealtimeLogger {
  log(level, message, payload = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      service: "realtime",
      environment: env.NODE_ENV,
      logLevel: level,
      message,
      ...payload
    };

    if (isProduction) {
      console.log(JSON.stringify(logEntry));
    } else {
      const colors = {
        debug: "\x1b[36m", // Cyan
        info: "\x1b[32m",  // Green
        warn: "\x1b[33m",  // Yellow
        error: "\x1b[31m"  // Red
      };
      const reset = "\x1b[0m";
      const color = colors[level] || "";
      
      const { requestId, connectionId, duration, status, ...rest } = payload;
      let metaStr = "";
      if (connectionId) metaStr += ` | connId: ${connectionId}`;
      if (requestId) metaStr += ` | reqId: ${requestId}`;
      if (status) metaStr += ` | status: ${status}`;
      if (duration) metaStr += ` | duration: ${duration}ms`;

      console.log(
        `[${logEntry.timestamp}] [realtime] ${color}[${level.toUpperCase()}]${reset} ${message}${metaStr}`,
        Object.keys(rest).length ? rest : ""
      );
    }
  }

  debug(message, payload) {
    if (!isProduction) {
      this.log("debug", message, payload);
    }
  }

  info(message, payload) {
    this.log("info", message, payload);
  }

  warn(message, payload) {
    this.log("warn", message, payload);
  }

  error(message, payload) {
    this.log("error", message, payload);
  }
}

export const logger = new RealtimeLogger();
export default logger;
