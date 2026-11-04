import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Imagens usadas pelos blocks do shadcn/studio
      { protocol: "https", hostname: "images.unsplash.com" },
      // Assets servidos pelo Figma MCP local (/ftc), só em dev
      ...(isDev
        ? [{ protocol: "http" as const, hostname: "localhost", port: "3845" }]
        : []),
    ],
    // Next 16 bloqueia imagens de IP local por padrão; liberado só em dev para o /ftc
    dangerouslyAllowLocalIP: isDev,
  },
};

export default nextConfig;
