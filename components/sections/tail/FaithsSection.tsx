"use client";

import type { FaithsProps } from "@/lib/sectionProps";
import FaithTiles from "../FaithTiles";

export default function FaithsSection({ order, tiles, labels }: FaithsProps) {
  return (
    <>
      <p className="container-kashi -mt-4 text-center text-xs uppercase tracking-[0.2em] text-kashi-diya/80">{order}</p>
      <FaithTiles tiles={tiles} labels={labels} />
    </>
  );
}
