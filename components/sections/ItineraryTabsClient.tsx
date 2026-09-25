"use client";

import type { Itinerary } from "@/lib/content";
import ItineraryTabs from "./ItineraryTabs";

/** Thin wrapper: turns serialisable strings into the label callbacks the tabs use. */
export default function ItineraryTabsClient({
  itineraries,
  tabs,
  dayTemplate,
  sunrise,
  sunset,
  placeNames,
}: {
  itineraries: Itinerary[];
  tabs: string[];
  dayTemplate: string;
  sunrise: string;
  sunset: string;
  placeNames: Record<string, string>;
}) {
  return (
    <ItineraryTabs
      itineraries={itineraries}
      labels={{ tabs, day: (n) => dayTemplate.replace("{n}", String(n)), sunrise, sunset }}
      placeNames={placeNames}
    />
  );
}
