import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "siwgptjhirmkabyjmddm.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "kentelle.com",
        pathname: "/cdn/shop/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
    dangerouslyAllowSVG: true,
    unoptimized: false,
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
