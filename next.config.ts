import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // default 1mb es chico para un PDF de resumen (puede traer imágenes/logos)
    serverActions: { bodySizeLimit: "10mb" },
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  // pdf-parse (pdf.js) necesita quedar fuera del bundle serverless para que
  // sus workers se resuelvan bien en Vercel — ver docs/troubleshooting.md del paquete.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
