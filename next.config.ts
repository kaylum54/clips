import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize Remotion packages for server-side rendering
  serverExternalPackages: [
    '@remotion/bundler',
    '@remotion/renderer',
    '@remotion/cli',
    'esbuild',
  ],
};

export default nextConfig;
