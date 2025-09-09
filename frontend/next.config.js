/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper hydration
  experimental: {
    optimizePackageImports: ['@dynamic-labs/sdk-react-core', '@dynamic-labs/wagmi-connector']
  },
  // Set output file tracing root for Vercel deployment
  outputFileTracingRoot: require('path').join(__dirname, '../'),
  // Disable static optimization to prevent SSR issues with Dynamic Labs
  output: 'standalone',
  trailingSlash: false
};

module.exports = nextConfig; 