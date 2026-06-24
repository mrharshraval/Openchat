import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.3"],
  turbopack: {
    root: process.cwd(),
  },
  serverExternalPackages: ["better-sqlite3"],
}

export default nextConfig
