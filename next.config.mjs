/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
  }
};

export default nextConfig;
