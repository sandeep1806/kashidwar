"use client";

import type { ItinerariesProps } from "@/lib/sectionProps";
import ItineraryTabs from "../ItineraryTabs";

export default function ItinerariesSection({ itineraries, tabs, dayTemplate, sunrise, sunset, placesNote, placeNames }: ItinerariesProps) {
  return (
    <div className="mt-12">
      <ItineraryTabs
        itineraries={itineraries}
        labels={{ tabs, day: (n) => dayTemplate.replace("{n}", String(n)), sunrise, sunset }}
        placeNames={placeNames}
      />
      <p className="container-kashi mt-6 text-center text-xs text-kashi-ash/60">{placesNote}</p>
    </div>
  );
}
