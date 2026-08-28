import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this app so the build never infers a parent
  // directory from a stray lockfile above it.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
