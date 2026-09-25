"use client";

import dynamic from "next/dynamic";
import type { FinaleProps } from "@/lib/sectionProps";
import { useApproach } from "@/lib/useApproach";

// The lamp SVGs and their GSAP flicker load when the finale is scrolled near.
const FinaleSection = dynamic(() => import("./FinaleSection"), { ssr: false });

export default function FinaleBody(props: FinaleProps) {
  const { ref, ready } = useApproach<HTMLDivElement>();
  return (
    <div ref={ref} className="relative min-h-[40vh]">
      {ready && <FinaleSection {...props} />}
    </div>
  );
}
