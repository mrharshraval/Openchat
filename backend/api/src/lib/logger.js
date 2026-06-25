import { env } from "../config/env.js";

const isProduction = env.NODE_ENV === "production";

class BackendLogger {
  log(level, message, payload = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      service: "api",
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
      
      // Extract main properties for a cleaner single line in dev
      const { requestId, duration, status, ...rest } = payload;
      let metaStr = "";
      if (requestId) metaStr += ` | reqId: ${requestId}`;
      if (status) metaStr += ` | status: ${status}`;
      if (duration) metaStr += ` | duration: ${duration}ms`;

      console.log(
        `[${logEntry.timestamp}] [api] ${color}[${level.toUpperCase()}]${reset} ${message}${metaStr}`,
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

export const logger = new BackendLogger();
export default logger;
