import { env } from "@/env"

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogPayload {
  requestId?: string
  connectionId?: string
  userId?: string
  guestId?: string
  action?: string
  duration?: number
  status?: string | number
  errorCode?: string
  errorMessage?: string
  [key: string]: any
}

class FrontendLogger {
  private environment = env.NODE_ENV

  private formatLog(level: LogLevel, message: string, payload?: LogPayload) {
    const logData = {
      timestamp: new Date().toISOString(),
      service: "frontend",
      environment: this.environment,
      logLevel: level,
      message,
      ...payload
    }

    if (this.environment === "production") {
      if (level === "error" || level === "warn") {
        console.error(JSON.stringify(logData))
      }
    } else {
      const color = {
        debug: "color: #7f8c8d",
        info: "color: #3498db; font-weight: bold",
        warn: "color: #f39c12; font-weight: bold",
        error: "color: #e74c3c; font-weight: bold"
      }[level]

      console.log(
        `%c[frontend] [${level.toUpperCase()}] ${message}`,
        color,
        payload ? payload : ""
      )
    }
  }

  debug(message: string, payload?: LogPayload) {
    if (this.environment !== "production") {
      this.formatLog("debug", message, payload)
    }
  }

  info(message: string, payload?: LogPayload) {
    this.formatLog("info", message, payload)
  }

  warn(message: string, payload?: LogPayload) {
    this.formatLog("warn", message, payload)
  }

  error(message: string, payload?: LogPayload) {
    this.formatLog("error", message, payload)
  }
}

export const logger = new FrontendLogger()
export default logger
