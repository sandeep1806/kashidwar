import { guidesFeed } from "@/lib/feed";

/** Hindi RSS feed of the guides (linked from every Hindi page's head). */
export const dynamic = "force-static";

export function GET() {
  return guidesFeed("hi");
}
