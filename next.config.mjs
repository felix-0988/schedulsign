/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  // Disable ESLint during production builds to reduce memory usage
  // Linting is already done in CI/CD via GitHub Actions
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
