import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel deployment fails if output is forced to 'standalone'. 
  // We conditionally enable it only for our Docker builds.
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
};

export default nextConfig;
