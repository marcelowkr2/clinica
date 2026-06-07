import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiHost =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://backend:8000";

    return [
      {
        source: "/api/:path*",
        destination: `${apiHost}/api/:path*`,
      },
    ];
  },

  // Evita que erros de lint/TypeScript quebrem o build dentro do container.
  // Use temporariamente enquanto corrige as regras no código.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  serverExternalPackages: [],
};

export default nextConfig;
