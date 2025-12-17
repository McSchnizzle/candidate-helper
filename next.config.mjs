/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Required for Docker deployment
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
