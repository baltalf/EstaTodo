/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.ngrok-free.app',
      },
      {
        protocol: 'https',
        hostname: 'ngrok-free.app',
      },
    ],
  },
}

export default nextConfig;
