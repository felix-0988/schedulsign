/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Ensure AMPLIFY_APP_ORIGIN is baked into the bundle at build time.
    // Amplify Hosting only injects NEXT_PUBLIC_* vars into the SSR runtime,
    // so we derive AMPLIFY_APP_ORIGIN from NEXT_PUBLIC_APP_URL.
    AMPLIFY_APP_ORIGIN: process.env.AMPLIFY_APP_ORIGIN || process.env.NEXT_PUBLIC_APP_URL,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  // Disable ESLint and TypeScript checking during production builds
  // to reduce memory usage. Type checking and linting happen during
  // development and in CI/CD
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
