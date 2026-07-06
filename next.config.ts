import type { NextConfig } from "next";

const codespaceName = process.env.CODESPACE_NAME;

const codespaceAllowedOrigins = codespaceName
  ? [
      `${codespaceName}-3000.app.github.dev`,
      `${codespaceName}-3333.app.github.dev`,
    ]
  : [];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        ...codespaceAllowedOrigins,
        "localhost:3000",
        "127.0.0.1:3000",
        "localhost:3333",
        "127.0.0.1:3333",
        "localhost:3333",
        "127.0.0.1:3333",
        "*.app.github.dev",
        "turbo-invention-pj5w5wqpq5x43rjvx-3333.app.github.dev",
      ],
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
