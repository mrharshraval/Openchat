import type { NextConfig } from "next"

import path from "path"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.3"],
  turbopack: {
    root: path.join(process.cwd(), "../../"),
  },
  serverExternalPackages: ["better-sqlite3"],
}

export default nextConfig
