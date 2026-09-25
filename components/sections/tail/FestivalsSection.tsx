"use client";

import type { FestivalsProps } from "@/lib/sectionProps";
import FestivalsList from "../FestivalsList";

export default function FestivalsSection({ items, months, labels }: FestivalsProps) {
  return <FestivalsList items={items} months={months} labels={labels} />;
}
