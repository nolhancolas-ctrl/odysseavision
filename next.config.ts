import type { NextConfig } from "next";

const codespaceName = process.env.CODESPACE_NAME;

const codespaceAllowedOrigins = codespaceName
  ? [
      `${codespaceName}-3000.app.github.dev`,
    ]
  : [];

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  outputFileTracingIncludes: {
    "/api/admin/uploads/image": [
      "./node_modules/sharp/**/*",
      "./node_modules/@img/sharp-linux-x64/**/*",
      "./node_modules/@img/sharp-libvips-linux-x64/**/*",
      "./node_modules/@img/sharp-linux-arm64/**/*",
      "./node_modules/@img/sharp-libvips-linux-arm64/**/*",
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        ...codespaceAllowedOrigins,
        "localhost:3000",
        "127.0.0.1:3000",
      ],
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
