# kashidwar.com — SEO & AdSense readiness audit (25 Oct 2026)

Evidence base, all gathered on 24–25 Oct 2026:
- **Search Console API** (`scripts/gsc-report.py`, property `https://kashidwar.com/`, 25 Sep – 23 Oct), plus the user's 24-hour Performance screenshot of 24 Oct.
- **A crawl of all 194 sitemap URLs** with a Googlebot user agent: status, canonical, robots, title, description, H1, word count, inlinks and image alt.
- **Local Lighthouse 13** (mobile) against the live site. The PageSpeed Insights API was out of quota.
- **Official Google AdSense and Publisher Policy pages**, fetched 25 Oct 2026.
- **Google autocomplete** (101 polite requests, en/hi, gl=in) and current search results for competitor checks.

No search volumes, keyword difficulty or CPC figures appear below, because no tool that provides them was available. Labels: **[V]** verified, **[H]** hypothesis, **[R]** recommendation.

## 1. Executive summary

The technical base is strong. All 194 indexable URLs:
- return 200 with self-canonicals and index robots;
- have no duplicate titles or descriptions, one H1 each, and no orphan pages;
- have structured data that validates;
- score 100 for Accessibility, Best Practices and SEO in Lighthouse.

Growth so far comes from **date and time queries** ("bharat milap kab hai 2026", "varanasi air show ticket price/pass"):
- The air show guide drew about 265 clicks in 24 hours at about 13% CTR, against 163 clicks in the previous 28 days for the whole site.

The main weaknesses:
1. **Low CTR at positions 6–11.** The site averages 0.9%, and several queries have hundreds of impressions and 0 clicks.
2. **No privacy policy** while GA4 sets cookies. This blocks AdSense. Fixed in batch 1.
3. **Conflicting hreflang signals.** The HTTP `Link` header and the HTML disagreed. Fixed in batch 1.
4. **Thin event and festival pages** (about 340–370 words) facing deeper competitor pages.
5. **The About page's mission says "without the noise of advertising"**, which contradicts monetising with ads. This is an owner decision.

## 2. Technical SEO scorecard (transparent criteria)

| Area | Criterion | Result |
|---|---|---|
| Crawlability | robots.txt allows all; both sitemaps read by Google without errors | **Pass** [V] |
| Status codes | 194/194 sitemap URLs return 200; legacy Astro URLs return 308 to `/en/...`; http→https and www→apex return 301 | **Pass** [V] |
| Canonicals | 194/194 self-referencing; Google confirmed 12/13 sampled URLs as "Submitted and indexed" | **Pass**, one exception [V] |
| Home canonical | Google picked `https://kashidwar.com/` (which 307-redirects by language) as canonical for `/hi` | **Watch** [V], see issue 3 |
| hreflang | HTML: hi/en plus x-default → /en. The HTTP `Link` header listed 13 locales and x-default → `/` | **Fail → fixed** [V] |
| Indexing scope | 11 regional locales are noindex and kept out of the sitemap (deliberate, until reviewed) | **Pass** [V] |
| Titles | Unique; 106/194 over 65 characters (mostly the " · Kashi" suffix plus long Hindi titles) | **Needs improvement** [V] |
| Descriptions | Unique; 23/194 over 160 characters; none under 70 | **Pass, minor** [V] |
| Headings | Exactly one H1 per page | **Pass** [V] |
| Internal links | 0 orphans; every sitemap page has 3 or more inlinks | **Pass** [V] |
| Structured data | Organization, WebSite, Breadcrumb, Event, FAQPage, Article, TouristTrip/Attraction/Destination all pass the repo validator; Event rich result valid in Search Console | **Pass** [V] |
| Content depth | Median 517 words in `<main>`; minimum 339 (`/en/festivals/nag-nathaiya`) | **Needs improvement** for festival and project pages [V] |
| Images | 1,672 `<img>` on sitemap pages; 342 have `alt=""`, none lack the attribute. Spot checks found them on small thumbnails beside text that already names the place (decorative by design) | **Pass** [V for the spot-checked pages; not every one of the 342 was inspected] |
| Performance (lab, mobile) | `/hi` 84 (LCP 3.7 s, TBT 220 ms); air show guide 84 (LCP 4.2 s); `/hi/festivals/bharat-milap` 89 (LCP 3.3 s); CLS 0 everywhere | **Needs improvement** [V]: LCP is the gap; no CrUX field data yet |
| HTTPS & headers | HSTS (180 days), nosniff, X-Frame-Options, Referrer-Policy and Permissions-Policy present; no CSP | **Pass**; CSP optional [V] |
| Trust pages | About (646 words, who runs it and how facts are checked), contact email (Cloudflare Email Routing MX present; delivery not tested), credits | **Pass** [V]; Privacy **missing → added** |

## 3. Top 10 issues and opportunities

| # | Finding | Evidence | Severity | Fix |
|---|---|---|---|---|
| 1 | **No privacy policy**: GA4 sets `_ga` cookies and `/privacy` redirected to About | `/en/privacy` returned 404; About has no privacy text [V] | **P1** (required for AdSense) | **Done (batch 1):** `/[locale]/privacy` (hi/en), footer link, sitemap, `/privacy` → `/en/privacy` |
| 2 | **Conflicting hreflang** from next-intl's `Link` header | Header listed 13 locales and x-default → `/`; HTML lists hi/en and x-default → `/en` [V] | **P1** | **Done:** `alternateLinks: false` in `lib/i18n/routing.ts` |
| 3 | **Home canonical**: Google indexes `/` instead of `/hi` | URL inspection: "Duplicate, Google chose different canonical" [V] | P2 | Watch after fix 2. If it persists, make `/` a 308 to `/hi` (crawlers send no Accept-Language) or keep it as the x-default language router. Owner decision |
| 4 | **CTR at positions 6–11** | 28-day CTR 0.9%; for example "dashashwamedh ghat aarti time" 592 impressions / 0 clicks (pos 11.2); "sarnath to varanasi distance" 93 / 0 (pos 9.1) [V] | **P1** | **Done for 3 guides:** title and description now lead with the answer (time, distance, fare, date). Measure for 28 days |
| 5 | **Upcoming event peaks**: Chhath 13–16 Nov, Nag Nathaiya 13 Nov, Dev Deepawali 24 Nov, New Year darshan rush | Autocomplete depth: "dev deepawali 2026 boat booking/price/package/crowd/timing" [V] | **P1** | Add a boat price/booking/scam section to the Dev Deepawali guide before about 10 Nov; Chhath and Nag Nathaiya pages with dated facts |
| 6 | **Cannibalisation** between guides and entity pages | KV aarti guide vs darshan guide vs `/places/kashi-vishwanath`; ropeway guide vs project page; `varanasi-in-2-days` vs `/itineraries/2-day`; Dev Deepawali guide vs festival page [V, from content] | P2 | Assign one intent per URL (section 6); cross-link; avoid the same head term in two titles |
| 7 | **Thin festival and project pages** (339–370 words) | Crawl word counts [V] | P2 | Add sourced "how to attend / where / timings / crowd tips" blocks for festivals within 90 days; don't pad |
| 8 | **LCP 3.3–4.2 s** on lab mobile | Lighthouse: render-blocking CSS, unused JS, legacy JS, network dependency chain [V] | P2 | Inline critical CSS for guide pages; audit polyfills (`legacy-javascript`); the earlier perf pass shows framework JS is most of the cost [H] |
| 9 | **Missing Hindi hub** "बनारस में घूमने की जगह" | Very deep Hindi autocomplete; no page targets it [V] | P2 | One researched Hindi-first guide, linked from home and places |
| 10 | **Mission text vs ads** | About: "without the noise of advertising" [V] | P1 (if applying) | Owner decision: reword the mission ("ads are kept out of the way of the content") before applying, or don't apply |

## 4. AdSense readiness report

Official sources: [eligibility](https://support.google.com/adsense/answer/9724), [site readiness](https://support.google.com/adsense/answer/12176698), [disapproval reasons](https://support.google.com/adsense/answer/81904), [program policies](https://support.google.com/adsense/answer/48182), [publisher policies](https://support.google.com/publisherpolicies/answer/10502938), [low-value screens](https://support.google.com/publisherpolicies/answer/11112688), [required privacy content](https://support.google.com/adsense/answer/1348695), [EU consent / CMP](https://support.google.com/adsense/answer/13554116), [ads.txt](https://support.google.com/adsense/answer/12171612), [supported languages](https://support.google.com/adsense/answer/9727). Accessed 25 Oct 2026.

| Requirement | Type | Status | Evidence / action |
|---|---|---|---|
| 18+, own the site and can edit `<head>` | Official | **Pass** (owner) | Repo and Cloudflare under the owner's control |
| Root domain | Official | **Pass** | kashidwar.com |
| Site reachable over valid HTTPS, crawler not blocked | Official | **Pass** [V] | robots allows all; 301 to https |
| Original, sufficient, useful content | Official | **Pass, improvable** | 14 researched guides plus place, festival and project pages, all source-cited. Thinnest pages 339–370 words (item 7) |
| Easy navigation | Official | **Pass** [V] | Header menu, breadcrumbs, footer, 0 orphans |
| No ads on low-value or navigation screens | Official | **Plan** | Don't place ads on `/[locale]/map`, credits, privacy or the language-switcher pages |
| Supported language | Official | **Pass for hi/en**; Odia, Assamese and Sanskrit are **unsupported** | Never load ad code on `/or`, `/as`, `/sa`. Those pages are noindex already, but ads must still be off |
| Privacy policy with Google ad-cookie disclosure and opt-out links | Official | **Ready** | `/privacy` live after deploy. Its advertising section is pre-written and appears only when `NEXT_PUBLIC_ADSENSE_CLIENT` is set |
| Certified CMP for EEA/UK/CH (personalised ads) | Official (regional) | **Not set up** | About 1% of impressions come from outside India. Without a CMP those visitors get limited or non-personalised ads only. Optional: Google's own Privacy & messaging CMP |
| ads.txt | Recommended | **Not set up** | Add `public/ads.txt` with `google.com, pub-…, DIRECT, f08c47fec0942fa0` once the publisher ID exists |
| Invalid traffic rules | Official | **Pass** | No incentivised clicks; never click own ads |
| Ad placement | Official / best practice | **Plan** | Use in-content ad slots between sections on guides; none above the H1, none inside FAQ, fact strip or map; label only "Advertisements" |
| Scaled content abuse (spam policy) | Official | **Low risk** [H] | 11 machine-assisted regional locales are noindex. Keep them noindex until a native speaker reviews them |
| About / Contact pages | **Not an official requirement** | Pass anyway | Helps trust ([R]) |
| "N posts" / domain age / traffic minimums | **Not in official docs** | n/a | Unconfirmed claims; ignore |

**Pre-submission checklist**
1. Owner decision: reword the About mission sentence about advertising.
2. Deploy batch 1 (privacy page, hreflang fix).
3. Confirm `contact@kashidwar.com` delivers (send a test).
4. Get a publisher ID. Set `NEXT_PUBLIC_ADSENSE_CLIENT` in `wrangler.jsonc` vars, add the AdSense `<script>` (lazy-loaded like GA, hi/en and supported locales only), and add `public/ads.txt`.
5. Optional: set up Google's CMP for EEA/UK/CH.
6. Submit kashidwar.com in AdSense. Don't remove or resubmit during review (2–4 weeks).

## 5. Search Console baseline (25 Sep – 23 Oct 2026, final data)

- **Totals:** 163 clicks · 18,875 impressions · CTR 0.9% · average position 10.3 · 97% of impressions from India.
- **By locale:** /hi 78 clicks / 12,223 impressions; /en 52 / 5,529; legacy un-prefixed URLs 33 / 1,268 (308 redirects, consolidating).
- **Top pages by clicks:**
  - `/hi/festivals/bharat-milap` 36
  - `/festivals/ramnagar-ramlila` (legacy) 21
  - `/en/guides/varanasi-ropeway` 12
  - `/en/festivals/parshvanath-janma-kalyanak` 8 (pos 2.7)
- **Air show guide** (24-hour view, 24 Oct): top 10 queries 265 clicks / 2,068 impressions. "varanasi air show ticket price" alone: 122 / 1,328.

Rerun: `GSC_CREDENTIALS=<key> ~/.venvs/gsc/bin/python scripts/gsc-report.py --days 28 --rows 25` (now also prints CTR opportunities; `--page air-show` filters).

## 6. Keyword-to-URL map (one intent per URL)

| Cluster (example phrasings from autocomplete) | Intent | Owner URL | Priority |
|---|---|---|---|
| dev deepawali 2026 date / kab hai / timing | Date | `/guides/dev-deepawali-2026` | P1 |
| dev deepawali boat booking / price / package / crowd | Transactional-info | same guide (add booking and price section) | P1 |
| dev deepawali (evergreen meaning, history) | Info | `/festivals/dev-deepawali` | P3 |
| kashi vishwanath aarti time / mangla aarti booking / tatkal | Info + booking | `/guides/kashi-vishwanath-aarti-timings` | P1 |
| sugam / vip / sparsh darshan, gate no 4, temple timings today | Booking | `/guides/kashi-vishwanath-darshan` | P1 |
| kashi vishwanath history / who built | Info | `/places/kashi-vishwanath` | P2 |
| dashashwamedh ghat aarti time / ganga aarti time today / in winter | Info | `/guides/ganga-aarti-varanasi` | P1 |
| varanasi boat ride price per person / sunrise / private | Price | `/guides/varanasi-boat-ride` | P1 |
| varanasi ropeway kab chalu hoga / ticket price / route map | Info | `/guides/varanasi-ropeway` (the project page keeps status and timeline) | P1 |
| varanasi to sarnath distance / auto fare / bus | Navigational | `/guides/varanasi-to-sarnath` | P1 |
| sarnath museum / stupa timings | Info | `/places/sarnath` | P2 |
| namo ghat timings / direction / air show | Navigational | `/places/namo-ghat` (+ the event guide while live) | P2 |
| बनारस में घूमने की जगह / places to visit in varanasi | Info hub | **Gap: new Hindi-first guide** | P2 |
| varanasi 2 day itinerary / pdf | Plan | `/guides/varanasi-in-2-days` (`/itineraries/2-day` should link to it, not compete) | P2 |
| varanasi new year crowd / darshan restrictions | Info, seasonal | **Gap: new guide by mid-December** | P2 |
| chhath 2026 varanasi ghats | Date | `/festivals/chhath` | P2 |
| hotels near kashi vishwanath | Commercial | No page (OTAs dominate; low fit) | P3 |

## 7. Implementation plan

**Batch 1 (done in this commit, not yet deployed)**
- `content/privacy.json`, `app/[locale]/privacy/page.tsx`: privacy policy (hi/en; other locales show the English text with the usual note). The advertising section is hidden until `ADSENSE_CLIENT` is set.
- `lib/site.ts`: `ADSENSE_CLIENT` from `NEXT_PUBLIC_ADSENSE_CLIENT`.
- `messages/*.json`: `privacy.*` and `footer.privacy` in all 13 locales.
- `components/ui/SiteFooter.tsx`: Privacy link.
- `lib/sitemapEntries.ts`: `/privacy`.
- `next.config.ts`: legacy `/privacy` → `/en/privacy`.
- `lib/i18n/routing.ts`: `alternateLinks: false` (removes the conflicting hreflang `Link` header).
- Title and description rewrites:
  - `varanasi-to-sarnath`: distance and fare in the title and description.
  - `ganga-aarti-varanasi`: the time first in the description.
  - `dev-deepawali-2026`: "date 24 Nov … boat booking" in the title.
- `scripts/check-seo.mjs`: validates `WebPage` JSON-LD.
- `scripts/gsc-report.py`: CTR-opportunity list, `--rows`, `--page`, URL-prefix property fallback.
- Heading font re-subset (783 lines, 0 shaping diffs).

Risk is low. Rollback: `git revert <commit>`. If the home canonical gets worse after removing the `Link` header (not expected), set `alternateLinks: true` again.

**Next 30 days**
- Dev Deepawali guide: boat price and booking section, scam warnings, tithi and muhurat times.
- Chhath and Nag Nathaiya festival pages with dated, sourced visitor info.
- Air show "what happened" section.
- Rewrite titles and descriptions for the next CTR-opportunity rows after a fresh report.

**60 days**
- Hindi hub "बनारस में घूमने की जगह".
- New Year darshan and crowd guide (publish by about 15 Dec).
- Resolve cannibalisation pairs (section 6) with cross-links and title differentiation.
- AdSense application if the owner decides to go ahead.

**90 days**
- Performance pass on guide pages (critical CSS, legacy JS).
- Native-speaker review of one or two regional locales, then index them (`INDEXED_LOCALES`).
- Compare CTR and clicks against the baseline in section 5.

Correlation note: event traffic is seasonal. Compare like-for-like windows (for example, 28 days before and after a title change, excluding event spikes) before crediting a change.

## 8. Pre-deployment verification (25 Oct 2026, local production build; nothing pushed)

**Changes since batch 1 (second local commit)**
- **About page:** the mission no longer says "without the noise of advertising". All 13 locales now read: "The content always comes first: any ads on the site are kept clearly apart from it and never decide what is written."
- **Privacy policy:** checked against official sources.
  - GA4 cookie names and their 2-year lifetimes are from [Google](https://support.google.com/analytics/answer/11397207).
  - "GA4 does not log or store IP addresses" is attributed to [Google](https://support.google.com/analytics/answer/2763052).
  - Cloudflare Web Analytics is cookieless with no fingerprinting, per [Cloudflare](https://www.cloudflare.com/web-analytics/).
  - `NEXT_LOCALE` is described as set on every visit, which is accurate.
  - "We do not sell or share" is now "we do not sell" plus a list of who receives what.
  - The advertising text follows the [required AdSense disclosures](https://support.google.com/adsense/answer/1348695).
  - The EEA-consent sentence was removed because no CMP exists. Add it back only after a certified CMP is live.
- **Ad loading:**
  - `lib/ads.ts` (`AD_LOCALES` excludes `or`, `as`, `sa`; `NO_AD_PATHS`: map, credits, privacy).
  - `components/ui/AdSense.tsx`: idle-loaded Auto ads script.
  - `<meta name="google-adsense-account">`, Google's [ownership method](https://support.google.com/adsense/answer/12169212).
  - `app/ads.txt/route.ts`.
  
  All of this is inert while `NEXT_PUBLIC_ADSENSE_CLIENT` is empty: no script, no meta tag, and `/ads.txt` returns 404.
- `scripts/gsc-report.py --url`: inspects named URLs (Google canonical vs ours).
- **Dev Deepawali English title:** "(Dev Diwali)" restored, because "dev diwali varanasi 2026" is the guide's top query.

**Verified**
- **Build:** build, `tsc --noEmit`, ESLint (0 problems), `check-seo` (1,274 pages pass) and `check-i18n` (11/11 locales complete).
- **All 13 locales:** home, Sarnath guide, privacy and about return 200 with the correct `<html lang>`, and the new mission text is present.
- **Sitemap and redirects:** 196 URLs, including `/hi/privacy` and `/en/privacy`. `/privacy` returns 308 to `/en/privacy`, and the footer Privacy link is present.
- **Ad gate, tested with a dummy ID** (`ca-pub-0000000000000000`, local build only):
  - The meta tag is present on the 10 supported locales and absent on `or`, `as` and `sa`.
  - In headless Chrome the script loads on `/en`, `/hi` and `/ta` pages, and does **not** load on `/en/map`, `/en/privacy`, `/or/…`, `/as` or `/sa/…` (0 requests to googlesyndication).
  - `/ads.txt` serves `google.com, pub-…, DIRECT, f08c47fec0942fa0`.
  - Locales are separate root layouts, so a language switch is a full page load and the script cannot carry over.
- **Canonical and hreflang** (local):
  - No `Link` header.
  - `/hi` and `/en` are self-canonical with hreflang hi-IN/en-IN and x-default → `/en`.
  - Regional pages are noindex with no hreflang.
  - `/` returns 307 by cookie or Accept-Language (default `/hi`).
- **The 69 unprefixed URLs with impressions (90 days):**
  - `/` is the 307 language router.
  - All 68 others end in 200 on the matching `/en/…` page with a self-canonical: 37 in one hop, 31 in two (trailing slash, then the legacy rule).

**Search-intent check of the retitled pages (Search Console, 90 days)**
- **Sarnath guide:** queries are distance-led ("kashi to sarnath distance", "sarnath distance from varanasi", "banaras se sarnath kitna dur hai"), and the new titles lead with distance.
  - `/places/sarnath` (timings, history) and `/projects/sarnath-redevelopment` cover other intents, so no conflict.
- **Ganga aarti guide:** Dashashwamedh time queries rank around position 11, and the description now opens with that time.
  - "assi ghat aarti timings (evening/morning)" ranks at positions 41–55, and the guide has no Assi *evening* aarti time. That is a content gap, not a title problem; verify before adding.
  - Overlap: `/ghats` titles also say "Ganga Aarti timings" (/hi/ghats: 227 impressions, position 9.6). Recommend dropping that phrase from the ghats hub title.
- **Dev Deepawali guide:** queries are "dev diwali varanasi 2026", "banaras dev deepawali 2026 date" and "… kab hai 2026". The titles cover date, "kab hai" and "Dev Diwali".
  - Google already prefers the guide (1,147 impressions) over `/hi/festivals/dev-deepawali` (52). Both carry "2026 कब है", so watch for the festival page displacing the guide. If it does, make the festival page evergreen.

**Measuring the home canonical after deployment**
- Baseline (25 Oct): `/` is "Submitted and indexed"; `/hi` is "Duplicate, Google chose different canonical", with Google canonical `/`; `/en` is indexed.
- Weekly: `scripts/gsc-report.py --days 7 --rows 10 --url / --url /hi --url /en`, and record the Google canonical for `/hi`. Also compare page impressions for `/` vs `/hi`.
- **Success:** `/hi` shows "Submitted and indexed" with Google canonical `/hi`.
- **Decision point, 4 weeks after deployment:** if Google still picks `/`, choose between:
  - (a) setting the home page x-default to `/`, Google's pattern for a language-router home page; or
  - (b) making `/` a 308 to `/hi` and dropping Accept-Language detection on the root.
  
  This is an owner decision, because (b) changes what English browsers see first.

**Remaining blockers before AdSense review**
1. Deployment authorisation (both commits are local).
2. An AdSense account and publisher ID. Then set `NEXT_PUBLIC_ADSENSE_CLIENT` in `wrangler.jsonc` vars and redeploy. That turns on the meta tag, the script, ads.txt and the privacy advertising section together.
3. Confirm `contact@kashidwar.com` delivers.

**Not blockers, still open**
- A Google-certified CMP for EEA/UK/CH. It is optional, but without it visitors there get limited or non-personalised ads only.
- AdSense Auto ads placement settings: exclude the map in the AdSense UI as well, belt and braces, since client-side navigation from an allowed page to `/map` keeps an already-loaded script.
- Uncertainty: idle-loading the official script, rather than putting it in `<head>`, is a common pattern, but Google's policy says not to alter the code. The tag itself is unmodified and only its insertion is delayed. If AdSense flags verification, the meta tag still proves ownership.
