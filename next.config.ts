import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        // admin.thalf.store/ → serve the admin dashboard at root
        {
          source: '/',
          has: [{ type: 'host', value: 'admin.thalf.store' }],
          destination: '/admin/dashboard',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async redirects() {
    return [
      // www.thalf.store → thalf.store (canonical redirect)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.thalf.store' }],
        destination: 'https://thalf.store/:path*',
        permanent: true,
      },
      {
        source: '/returns',
        destination: '/return-policy',
        permanent: true,
      },
      {
        source: '/refunds',
        destination: '/refund-policy',
        permanent: true,
      },
      {
        source: '/returns-refunds',
        destination: '/return-policy',
        permanent: true,
      },
      {
        source: '/shipping',
        destination: '/shipping-policy',
        permanent: true,
      },
      {
        source: '/privacy',
        destination: '/privacy-policy',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
