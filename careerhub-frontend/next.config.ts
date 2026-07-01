import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  /* existing config options */
};

// Bundle analyzer only runs when ANALYZE=true
// Run: npm run analyze
export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);