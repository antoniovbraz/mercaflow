import type { NextConfig } from "next";
import { validateEnvVars } from './utils/env-validation';

// Validate environment variables on build and dev (skip on test)
if (process.env.NODE_ENV !== 'test') {
  try {
    validateEnvVars();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'mercaflow.vercel.app', '.vercel.app'],
    },
  },
  serverExternalPackages: [],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'http2.mlstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'http2.mlstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mlstatic.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
