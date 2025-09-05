/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper hydration
  experimental: {
    optimizePackageImports: ['@dynamic-labs/sdk-react-core', '@dynamic-labs/wagmi-connector']
  },
  // Fix workspace root warning
  turbopack: {
    root: '.'
  }
};

module.exports = nextConfig; 