/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["v0.blob.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig

