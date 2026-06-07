import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const apiBase = (
  isDev
    ? process.env.DEV_BACKEND_URL || "http://localhost:5000"
    : process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.BACKEND_URL ||
      ""
).replace(/\/$/, "");

let apiHostname: string | undefined;
try {
  if (apiBase) apiHostname = new URL(apiBase).hostname;
} catch {
  apiHostname = undefined;
}

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiBase) return [];
    return [
      {
        source: "/express/:path*",
        destination: `${apiBase}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
      ...(apiHostname
        ? [
            {
              protocol: "https" as const,
              hostname: apiHostname,
              pathname: "/uploads/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
