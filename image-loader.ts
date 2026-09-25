import type { ImageLoaderProps } from "next/image";

/**
 * next/image loader for Cloudflare (OpenNext). With Cloudflare Images enabled
 * on the zone and NEXT_PUBLIC_IMAGE_OPTIMIZATION=on, images go through
 * /cdn-cgi/image/ for resizing and AVIF/WebP negotiation. Otherwise, and in
 * `next dev`, the original file is served. SVG art passes `unoptimized`
 * explicitly and never reaches this loader.
 */
const normalizeSrc = (src: string) => (src.startsWith("/") ? src.slice(1) : src);

export default function cloudflareLoader({ src, width, quality }: ImageLoaderProps) {
  const params = [`width=${width}`];
  if (quality) params.push(`quality=${quality}`);
  if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_IMAGE_OPTIMIZATION !== "on") {
    return src;
  }
  return `/cdn-cgi/image/${params.join(",")}/${normalizeSrc(src)}`;
}
