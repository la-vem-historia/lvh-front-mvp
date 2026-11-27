import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Há um package-lock.json solto na pasta do usuário; sem isto o Next sobe a raiz do projeto até lá
const root = process.cwd();

const nextConfig: NextConfig = {
  turbopack: { root },
  outputFileTracingRoot: root,
  // Só em dev: deixa abrir o servidor pelo IP da rede local (ex.: no celular, no mesmo Wi-Fi)
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
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
