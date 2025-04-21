import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/issue',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
    ],
  },
};

export default nextConfig;
