import { ADSENSE_CLIENT } from "@/lib/site";

export const dynamic = "force-static";

/**
 * /ads.txt (support.google.com/adsense/answer/12171612): authorises Google to sell this
 * site's ad space. 404 until NEXT_PUBLIC_ADSENSE_CLIENT is set, because once an ads.txt
 * exists, ads only serve for the publisher IDs listed in it.
 */
export function GET() {
  if (!ADSENSE_CLIENT) return new Response("Not found", { status: 404 });
  const pub = ADSENSE_CLIENT.replace(/^ca-/, "");
  return new Response(`google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
