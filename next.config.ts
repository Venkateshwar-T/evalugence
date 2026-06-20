import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore - Some Next.js type definitions might not have this yet
  allowedDevOrigins: ['192.168.29.109'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline';"
          }
        ],
      },
    ];
  },
};

export default nextConfig;
