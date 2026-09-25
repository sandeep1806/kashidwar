"use client";

import type { CSSProperties } from "react";
import type { PhotoData } from "@/lib/contentTypes";
import { useApproach } from "@/lib/useApproach";
import Photo from "./Photo";

/**
 * A Photo whose <picture> is only mounted when it comes within `margin` of the
 * viewport. Native `loading="lazy"` starts fetching up to ~1250 px early, which
 * put the Day-in-Kashi backdrops (just below the hero) on the page-load path.
 * Until then the blur placeholder fills the frame.
 */
export default function LazyPhoto({
  photo,
  sizes,
  className = "",
  margin = "300px 100%",
}: {
  photo: PhotoData;
  sizes: string;
  className?: string;
  margin?: string;
}) {
  const { ref, ready } = useApproach<HTMLDivElement>(margin);
  const blur: CSSProperties = { backgroundImage: `url(${photo.blur})`, backgroundSize: "cover", backgroundPosition: "center" };
  return (
    <div ref={ref} className={`absolute inset-0 ${className}`} style={blur}>
      {ready && <Photo photo={photo} sizes={sizes} />}
    </div>
  );
}
