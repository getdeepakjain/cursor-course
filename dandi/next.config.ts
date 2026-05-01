import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/** Directory containing this config (the Next app), not the git repo root. */
const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // When the parent folder has its own lockfile/node_modules, Turbopack can infer the wrong root and fail to resolve packages (e.g. tailwindcss).
  turbopack: {
    root: appDir,
  },
};

export default nextConfig;
