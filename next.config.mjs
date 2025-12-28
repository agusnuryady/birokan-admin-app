import bundleAnalyzer from '@next/bundle-analyzer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Replicate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer({
  turbopack: {
    // Now __dirname is defined and safe to use
    root: __dirname,
  },
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
});