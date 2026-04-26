import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "siwgptjhirmkabyjmddm.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Fallback gracefully when image 404s in development
    dangerouslyAllowSVG: true,
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
