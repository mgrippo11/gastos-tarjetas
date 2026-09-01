import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // default 1mb es chico para un PDF de resumen (puede traer imágenes/logos)
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
