import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['openai'],
  experimental: {
    // Increase body size for multimodal uploads
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
};

export default nextConfig;
