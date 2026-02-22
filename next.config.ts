import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fix yahoo-finance2 Deno import issues
      config.resolve.alias = {
        ...config.resolve.alias,
        "@std/testing/mock": false,
        "@std/testing/bdd": false,
        "@gadicc/fetch-mock-cache/runtimes/deno.ts": false,
        "@gadicc/fetch-mock-cache/stores/fs.ts": false,
      };
    }
    return config;
  },
};

export default nextConfig;
