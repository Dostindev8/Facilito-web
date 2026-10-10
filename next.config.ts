import type { NextConfig } from 'next';

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://facilitord.vercel.app').replace(/\/+$/, '');
const isProd = process.env.NODE_ENV === 'production';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    inlineCss: true,
  },
  images: {
    remotePatterns: [],
  },
  async redirects() {
    return [
      { source: '/login', destination: `${APP_URL}/login`, permanent: false },
      { source: '/register', destination: `${APP_URL}/login?tab=registro`, permanent: false },
      { source: '/modulos', destination: '/features', permanent: true },
    ];
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
