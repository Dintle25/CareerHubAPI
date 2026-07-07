import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* existing config options */
};

const bundleAnalyzedConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);

export default withSentryConfig(bundleAnalyzedConfig, {
  org: "own-pw",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});



// import type { NextConfig } from "next";
// import withBundleAnalyzer from "@next/bundle-analyzer";

// const nextConfig: NextConfig = {
//   /* existing config options */
// };

// // Bundle analyzer only runs when ANALYZE=true
// // Run: npm run analyze
// export default withBundleAnalyzer({
//   enabled: process.env.ANALYZE === "true",
// })(nextConfig);