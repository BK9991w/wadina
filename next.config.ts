
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "*.cloudflare.com",
    "*.ngrok.io",
    "*.ngrok-free.app",
    "*.loca.lt",
  ],

 images: {
  unoptimized: true,
  remotePatterns: [
    {
      protocol: "https",
      hostname: "images.pexels.com",
    },
  ],
},

export default nextConfig;
