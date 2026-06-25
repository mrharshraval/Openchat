import express from "express";
import cors from "cors";
import crypto from "crypto";
import { env } from "./src/config/env.js";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import bcrypt from "bcryptjs";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "./src/lib/logger.js";
import { requestContext, getRequestId } from "./src/lib/context.js";

const app = express();
const PORT = env.PORT;
const resend = new Resend(env.RESEND_API_KEY);
const EMAIL_FROM = env.EMAIL_FROM;

// Setup Prisma client
const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
  ]
});

// Prisma Query Instrumentation
prisma.$on("query", (e) => {
  const reqId = getRequestId();
  if (e.duration > 100) {
    logger.warn(`Slow Database Query: ${e.query}`, {
      requestId: reqId,
      duration: e.duration,
      params: e.params
    });
  } else {
    logger.debug(`Database Query: ${e.query}`, {
      requestId: reqId,
      duration: e.duration,
      params: e.params
    });
  }
});

prisma.$on("error", (e) => {
  const reqId = getRequestId();
  logger.error(`Database Error: ${e.message}`, {
    requestId: reqId,
    errorMessage: e.message
  });
});

app.use(cors());
app.use(express.json());

// Request Tracing and Logging Middleware
app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);

  requestContext.run({ requestId }, () => {
    const startTime = performance.now();
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";

    logger.info(`Request started: ${req.method} ${req.originalUrl}`, {
      requestId,
      httpMethod: req.method,
      route: req.originalUrl,
      clientIp,
    });

    res.on("finish", () => {
      const duration = Math.round(performance.now() - startTime);
      const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
      
      logger.log(level, `Request finished: ${req.method} ${req.originalUrl} - Status ${res.statusCode}`, {
        requestId,
        httpMethod: req.method,
        route: req.originalUrl,
        clientIp,
        status: res.statusCode,
        duration,
      });
    });

    next();
  });
});

// Helper to get client IP
const getClientIp = (req) => {
  return req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
};

// 1. PUBLIC: Register Route
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({ error: "Email is already registered and verified" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const ipAddress = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";

    let user;
    if (existingUser) {
      user = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          lastIp: ipAddress,
          userAgent,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          lastIp: ipAddress,
          userAgent,
        },
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: otp,
        expires,
      },
    });

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: "Verify your email for Moots",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: auto; border: 1px solid #eaeaea; border-radius: 5px;">
            <h2 style="color: #333; text-align: center;">Welcome to Moots!</h2>
            <p>Please verify your email by entering the following One-Time Password (OTP):</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #6366f1; background-color: #f3f4f6; padding: 10px 20px; border-radius: 5px;">${otp}</span>
            </div>
            <p style="color: #666; font-size: 14px;">Valid for 15 minutes.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email send failed:", emailError);
      return res.status(500).json({ error: "Could not send verification email." });
    }

    return res.status(200).json({ message: "Registration successful. OTP sent." });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 2. PUBLIC: Verify OTP Route
app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const verificationToken = await prisma.verificationToken.findFirst({
      where: { identifier: email, token: otp },
    });

    if (!verificationToken) {
      return res.status(400).json({ error: "Invalid OTP code" });
    }

    if (new Date() > verificationToken.expires) {
      await prisma.verificationToken.delete({ where: { token: otp } });
      return res.status(400).json({ error: "OTP has expired" });
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({ where: { token: otp } });

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify-otp error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 3. PUBLIC: Login Verification Route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: "Credentials are required" });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user || !user.password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Update IP, userAgent, and lastLoginAt
    const ipAddress = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastIp: ipAddress,
        userAgent,
        lastLoginAt: new Date(),
      },
    });

    return res.status(200).json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        username: updatedUser.username,
        bio: updatedUser.bio,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 4. SECURE: Update Profile Settings
app.put("/api/user/settings", async (req, res) => {
  try {
    const { userId, username, name, bio, image } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (username) {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({ error: "Invalid username format" });
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return res.status(400).json({ error: "Username is already taken" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username !== undefined ? { username } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(image !== undefined ? { image } : {}),
      },
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        bio: updatedUser.bio,
        image: updatedUser.image,
      },
    });
  } catch (error) {
    console.error("Settings error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 5. PUBLIC: Health check endpoint
app.get("/health", async (req, res) => {
  let dbStatus = "UP";
  let errorMsg = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = "DOWN";
    errorMsg = err.message;
  }

  const isHealthy = dbStatus === "UP";
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "healthy" : "unhealthy",
    service: "moots-api",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    services: {
      api: "UP",
      database: dbStatus
    },
    ...(errorMsg && { error: errorMsg })
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  const requestId = req.requestId || getRequestId();
  const statusCode = err.status || err.statusCode || 500;
  
  logger.error(`Unhandled Exception: ${err.message}`, {
    requestId,
    httpMethod: req.method,
    route: req.originalUrl,
    status: statusCode,
    errorCode: err.code || "INTERNAL_SERVER_ERROR",
    errorMessage: err.stack || err.message,
  });

  res.status(statusCode).json({
    error: env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
    code: err.code || "INTERNAL_SERVER_ERROR",
    requestId,
  });
});

// Startup Validation Check
async function validateStartup() {
  logger.info("Running startup checks and diagnostics...");
  logger.info("Configuration summary:", {
    service: "moots-api",
    version: "1.0.0",
    environment: env.NODE_ENV,
    port: env.PORT,
  });

  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Startup Check: Database connection successful.");
  } catch (err) {
    logger.error("Startup Check Failed: Database is unreachable.", {
      errorMessage: err.message,
    });
    process.exit(1);
  }
}

validateStartup().then(() => {
  app.listen(PORT, () => {
    logger.info(`Express REST API listening on port ${PORT}`);
  });
});
