import type { ItinerariesProps } from "@/lib/sectionProps";
import Static from "@/components/ui/Static";
import ItineraryTabs from "../ItineraryTabs";

export default function ItinerariesSection({ itineraries, tabs, dayTemplate, sunrise, sunset, placesNote, placeNames }: ItinerariesProps) {
  return (
    <div className="mt-12">
      <ItineraryTabs
        itineraries={itineraries}
        labels={{ tabs, dayTemplate, sunrise, sunset }}
        placeNames={placeNames}
      />
      <Static>
        <p className="container-kashi mt-6 text-center text-xs text-kashi-ash/60">{placesNote}</p>
      </Static>
    </div>
  );
}
