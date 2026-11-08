import { guidesFeed } from "@/lib/feed";

/** English RSS feed of the guides (linked from every non-Hindi page's head). */
export const dynamic = "force-static";

export function GET() {
  return guidesFeed("en");
}
