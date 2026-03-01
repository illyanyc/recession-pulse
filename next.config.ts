import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
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

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  tunnelRoute: "/monitoring",
});
