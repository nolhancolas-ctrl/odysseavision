import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3333",
        "127.0.0.1:3333",
        "*.app.github.dev",
        "turbo-invention-pj5w5wqpq5x43rjvx-3333.app.github.dev",
      ],
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
