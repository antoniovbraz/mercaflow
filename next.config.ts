import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'mercaflow.vercel.app', '.vercel.app'],
    },
  },
  serverExternalPackages: [],
};

export default nextConfig;
