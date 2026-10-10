import type { NextConfig } from 'next';

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://facilitord.vercel.app').replace(/\/+$/, '');
const isProd = process.env.NODE_ENV === 'production';
/** Vercel preview/development deployments must never be indexed. */
const isPreview = Boolean(process.env.VERCEL_ENV) && process.env.VERCEL_ENV !== 'production';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : []),
  ...(isPreview ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    inlineCss: true,
    serverActions: { bodySizeLimit: '32kb' },
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
