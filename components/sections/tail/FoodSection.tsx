"use client";

import type { FoodProps } from "@/lib/sectionProps";
import FoodList from "../FoodList";

export default function FoodSection({ items, labels }: FoodProps) {
  return <FoodList items={items} labels={labels} />;
}
