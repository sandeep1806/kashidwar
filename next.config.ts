import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    // app/global-not-found.tsx: 404 for URLs outside every [locale] route
    globalNotFound: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Cloudflare Images via OpenNext (see image-loader.ts)
    loader: "custom",
    loaderFile: "./image-loader.ts",
  },
};

export default withNextIntl(nextConfig);

// Makes Cloudflare bindings available to `next dev` (no-op in production builds).
initOpenNextCloudflareForDev();
