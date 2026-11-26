# Daily content review — instructions for the review agent

You are reviewing the content of kashidwar.com, a Varanasi (Kashi) travel guide; one focus a day.
This file is the agent's brief; the repository owner edits it to change what is checked.
Runs come from `scripts/content-review.sh` on the maintainer's machine (daily: Sonnet, 80
turns, one focus; first Monday of the month: Opus, full review), in a fresh worktree of
`origin/redesign`. The prompt tells you the run type, the **focus** and the **budget** (turns). GitHub runs CI on the pull request the script opens; the script merges it when CI is green and GitHub deploys the merge, so your changes go live without a human reading them first — be conservative: when in doubt, list it under "Needs a human look" instead of changing it.

Follow `CLAUDE.md` and `DESIGN.md` in this repository at all times. In particular:
every faith of Kashi is presented with equal care and no ranking; use each tradition's own
terminology; every fact needs a source; anything you cannot verify from a reliable source is
labelled "not officially confirmed" (`"verified": false` on projects, `"unconfirmed": true` on
guide sections); nothing voyeuristic about cremation grounds.

## Hard rules

1. **Files you may edit — nothing else:**
   - `content/*.json` (top level: projects, festivals, festival-dates, places, food, itineraries, faiths)
   - `content/details/en.json` and `content/details/hi.json` (visitor sections on festival, project and place pages)
   - `content/guides/*.json` (including new guides — they are picked up automatically, no code needed)
   - `content/guides/i18n/*.json` (regional translations of guides **and blog posts**, keyed by slug)
   - `content/blog/*.json` (blog posts and `content/blog/calendar.json`; `blog` focus only)
   - `TRANSLATION_REVIEW.md`
   Never touch code, `package*.json`, config, scripts, `messages/`, `content/i18n/`, photos,
   workflows, `.claude/`, or secrets, and not `content/review-log.json` (the script writes it). The script rejects the run if any other path changes.
2. **Never copy text from news articles or other sites.** Read the source, then write an
   original, short summary in the site's voice (present tense, factual, no superlatives).
   Quoting official figures (dates, fares, timings, lengths) is fine.
3. **Sources:** prefer official ones (government departments and press releases — PIB, UP
   government, kashi.gov.in, varanasi.nic.in, VDA, NHAI, Indian Railways, AAI, ASI, UNESCO —
   temple trusts such as shrikashivishwanath.org), then major news (PTI, ANI, The Hindu, Indian
   Express, Times of India, Hindustan Times, Amar Ujala, Dainik Jagran, Aaj Tak, ETV Bharat, DD).
   A change needs at least one such source. Blogs and travel agencies never count on their own.
4. **Hindi and English together:** whenever you change English text, change the matching Hindi
   text in the same edit (`name_hi`, `*_hi`, `i18n.hi`), in natural Hindi. **Guides are
   published in all 13 languages:** a new guide, or a changed guide section, also gets its
   translation in every `content/guides/i18n/<locale>.json` (as, bn, gu, kn, ml, mr, or, pa,
   sa, ta, te), with exactly the same number of facts, sections, body paragraphs, list items
   and FAQs as the English, numbers and dates unchanged, natural text for native readers.
   Other regional content (`content/i18n/*.json`, including `content/i18n/entries/`) is NOT
   edited — list every affected entry under a new dated heading in `TRANSLATION_REVIEW.md`.
5. **Dates:** today's date is given in the prompt. Keep ISO dates (`YYYY-MM-DD`). Never move a
   `lastVerified` date forward unless you actually re-checked that entry this run.
6. **When unsure, do not change it** — mention it in the summary as "needs a human look".
7. Keep JSON formatting as it is (the files use 2-space or 1-space indentation; match the file).
8. **No Islamic listings:** the owner removed them in November 2026 (mosques, dargahs, Eid,
   Muharram, an "Islamic" faith). Never add or propose such entries; neutral factual mentions
   inside other entries (Gyanvapi beside Kashi Vishwanath, Lal Khan's Tomb at Raj Ghat) stay.

## Focus: what each run checks

The prompt names one focus. Do only the checks for that focus (numbers refer to the sections
under "What to check"):

| Focus | Checks | When |
|---|---|---|
| `places` | 1b for the places listed in the prompt (one quarter of the A–Z list) | Tuesday–Friday |
| `festivals` | 2, plus the festival pages' own facts in `content/festivals.json` | Monday (not the first) |
| `guides` | 3 | Saturday |
| `developments` | 1, 4, 4b, 4c and 5 | Sunday |
| `projects` | 1 | on demand |
| `full` | 1–5 (with 4b and 4c) | monthly, first Monday |
| `blog` | 6 only (**not** 4b/4c): write the week's blog post | weekly, own schedule |

**Every run except `blog`, whatever its focus, also does 4b and 4c first** (upcoming major events and finished
events): a big event is a traffic opportunity that cannot wait for its week in the rotation.

**Every run, including `blog`, starts with step 0, the Search Console keyword pass**, when the
prompt says a snapshot is available. Search traffic is the owner's top goal: a fact check that
leaves a page's title missing what people actually search is only half done.

Update a "last verified" date (`lastVerified` on projects, `updated` on guides, a festival
date's verification fields) **only for entries you actually re-checked in this run**.

## Budget: stop and report

Runs are capped by turns (the prompt gives the limit; the run is cut off when it hits it). Partial work is fine and still becomes a pull request, so:

1. After the first two or three entries, write `.content-review-pr.md` with the summary so far,
   and update it after every few entries. If the run is cut off, that file is the report.
2. Keep a running count of your turns. When about 80% of the turn budget is used (for example
   32 of 40), stop checking, validate the files you touched, and finalise the summary: list
   what was checked, and under "Run notes" what was **not** reached this time.
3. Prefer finishing fewer entries properly over touching many superficially. Start with the
   entries most likely to have changed (under-construction or announced projects, the next
   festivals, fares and timings).
4. `npm` is not available in the review's worktree (no `node_modules`); CI builds, lints and
   SEO-checks the pull request. Always validate JSON with `python3 -m json.tool`.

## Working method

Keep every working file (URL lists, status dumps, notes) in `.review-tmp/` — it is git-ignored.
Never create files anywhere else in the repository except the allowed content files and
`.content-review-pr.md`.

Complete the checks for your focus, within the budget. Work entry by entry (a TodoWrite
list helps). For link checks, loop over the URLs with `curl` in small batches. Use `python3`
for reading or rewriting JSON when that is simpler than editing by hand, and `python3 -m
json.tool <file>` to validate every file you touched.

## What to check

### 0. Search Console keyword pass (every run, when the snapshot exists)

The script puts the last 28 days of Google Search Console data in `.review-tmp/gsc.json` (read it
with `jq` or `python3`; do not try to reach Search Console yourself). It holds:

- `focus.pages`: this run's pages (the places in the prompt, the festivals, guides, projects or
  blog posts of the focus), most missed clicks first. Each has `topQueries` (query, impressions,
  clicks, CTR, position), `titleLivesIn` (the file and fields that hold its search title, or why
  it cannot be edited here) and `flags`.
- `opportunities`: query + page pairs on Google's first two pages with a CTR well under normal.
- `drops`: pages whose impressions collapsed in the last 14 days against the 14 before.
- `overlaps`: queries where two of our pages in the same language split the impressions.

**Budget:** at most **5 pages** and about **15 turns**, before the focus checks. Take the first
pages of `focus.pages`; skip pages under 50 impressions. In a `blog` run, use the snapshot only
to keep the new post's title off queries another page already owns (see `overlaps`).

For each page:

1. **Read the page's current title and description** from `titleLivesIn`, and check
   `git log --since=14.days -p -- <file>` for the same field: if the title or description was
   changed in the last 14 days, leave it alone (Google needs time to re-rank) and only note it.
2. **Find what searchers want.** Group `topQueries` by intent (date, timings, fare or ticket,
   booking, route or distance, history, "in hindi", near me) and weigh by impressions. The
   dominant phrasing, in the page's own language and script, should lead the title.
   Romanised Hindi queries ("kab hai", "timings") on a `/hi/` page are normal: use the Devanagari
   title and the most-searched English keyword (e.g. "timings", "route", "fare") only if it fits.
3. **Rewrite when the title misses the top intent** or the CTR is under half the normal rate for
   its position (`opportunities` shows these). Rules:
   - Title: the searched phrase first, then the two or three answers people want (a number,
     a time, a fare range), about 60 characters (Hindi up to about 65). Do not add "· Kashi": the
     site adds it. Every number in the title must already be in the page's sourced content.
   - Description: 120–155 characters, answers the main question in the first sentence with a
     sourced fact, then says what else the page covers.
   - One spelling per title. Never list misspellings or variants ("dipawali / dipawli / diwali"):
     Google matches those itself, and stuffing hurts.
   - Never change slugs, URLs, headings in the middle of a guide, or facts. Keep
     each faith's own terminology (CLAUDE.md).
   - English and Hindi move together (rule 4). For guides and blog posts, also update the
     same slug's `title` and `description` in all 11 regional files in
     `content/guides/i18n/` (rule 4). For a place whose regional `seoTitle` exists in
     `content/i18n/entries/`, list it in `TRANSLATION_REVIEW.md` instead (rule 4).
4. **When a top query is a question the page does not answer** (guides and blog posts only),
   append an FAQ in the searcher's words with a sourced answer, as in 4d (append at the end;
   translate into the regional files).
5. **Flags:**
   - `answered-in-google`: the page ranks 1–3 for a date question but gets no clicks, because
     Google shows the date itself. Do not chase the date wording: make the title and description
     promise what needs a click (timings, booking, prices, route, live updates).
   - `dropped`: do not guess at the cause. List it under "Needs a human look" with the numbers,
     and check whether the page is out of date (a past event still presented as upcoming is the
     usual reason); if it is, fix the content as in 4c.
6. **Pages you cannot edit** (`titleLivesIn.editable` is false: festival titles come from a
   template, regional place titles live elsewhere): write the title you would use and why under
   "Needs a human look".
7. **Overlaps** among the focus pages: say which page should own the query under "Needs a human
   look"; do not de-optimise a page yourself.

Report every change in a "Search Console keyword pass" table (see Output). If no page needed a
change, say which pages you looked at and why they were fine.

### 1. Projects — `content/projects.json`
For every project: re-verify `status` (`completed` | `under_construction` | `announced`),
`timeline`, `agency` and every entry in `sources`. If the status or timeline changed, update
`status`, `timeline`, `summary` (English + Hindi) and add the new source first in `sources`.
Set `lastVerified` to today for every project you re-checked, even if nothing changed. If a
status cannot be confirmed from an official source, set `"verified": false`.

### 1b. Place facts "at a glance" — `content/places.json` → `glance`
Every place carries `glance` (timings, entry fee, duration, season, crowd, photography, dress,
`verified`, `sources`, `booking`). On a `places` focus, for **every place listed in the prompt**:
- re-check `timings` and `entry` against the trust / ASI / government page named in
  `glance.sources`; update English and the Hindi override in `i18n.hi.glance`, set
  `verified: true` only when both come from an official source, and add the page you read to
  `glance.sources`. Keep the strings short (they render as icon chips).
- **Tickets:** where a fee is charged, find out whether tickets can be bought online and/or at
  the counter, and the price of each (ASI monuments: ₹5 less online or by card for Indians,
  ₹50 for foreigners — see the ASI Sarnath Circle visitor page). Record an official online
  booking page in `glance.booking` = `{ "url", "counter": true when the gate also sells tickets,
  "via": "asi" | "asiMuseum" | "temple", "guide"? }` — only the owner's own site (ASI booking
  asi.paygov.org.in/asi-webapp/#/ticketbooking, linked from asi.nic.in; the older
  asi.payumoney.com; the temple trust's site), never a reseller. ASI places carry
  `"guide": "sarnath-ticket-online-booking"`, so the tile opens that guide's verified steps. The
  tile's label and note text come from `messages/` (fixed per `via`); if a place needs a booking
  kind that none of these notes fits, list it under "Needs a human look" instead of adding it.
- **ASI booking guide** (`content/guides/sarnath-ticket-online-booking.json`, on the places
  focus that includes `sarnath`, and on `full`): open the booking site, Circle → Sarnath, and
  check the monument list, slot names and online fares against the guide's steps and price
  list (go only as far as the visitor-details summary; never enter details or pay). Check that
  asi.nic.in still links the same booking address. Update English, Hindi and the 11 regional
  translations together when anything changed.
- look for news since the last check: closures, renovation, new timings or rules, a new fee,
  reopened areas; update `summary`/`tips` (English + Hindi) when a reliable source confirms it.
- check that every URL in the place's `sources` and `glance.sources` still answers (dead
  links: replace or remove, as in check 5).
Changed English/Hindi place text that also has regional overrides in
`content/i18n/entries/<locale>.json` is listed in `TRANSLATION_REVIEW.md` (rule 4).

### 2. Festival dates — `content/festival-dates.json`
For every festival in `content/festivals.json`, look for newly announced dates in the next
12 months (from today). Use published panchangs for Varanasi (e.g. Drik Panchang with the
Varanasi location), the UP government and DoPT holiday lists, and organiser announcements
(UP Tourism for Ganga Mahotsav, the Ministry of Education for Kashi Tamil Sangamam). Add or
correct occurrences following the file's existing structure, including its `verified` flags
and source fields. Never invent a date: an unannounced festival stays as it is.

### 3. Volatile facts in the guides — `content/guides/*.json`
Re-check, and update if changed (both languages; bump the guide's `updated` date):
- Kashi Vishwanath: darshan/opening hours, aarti timings, Sugam Darshan fee and rules
  (official: shrikashivishwanath.org booking list), locker and phone rules.
- Ganga Aarti: evening start times by season at Dashashwamedh, and the morning Subah-e-Banaras
  and evening aarti at Assi (section `assi-ghat-aarti-time`, approximate until an organiser or
  news report gives times); monsoon relocations if the river is high.
- Varanasi ropeway: status, opening date, fares (fares stay `"unconfirmed": true` until an
  official fare notification exists).
  **Opening day is a top search moment** ("varanasi ropeway kab chalu hoga", "start date",
  "ticket price", "timing"): search for it on every run in November–December 2026, and the day
  passenger service starts (official or two major outlets), update `varanasi-ropeway.json` in
  the same run: title/description to "now open" with the start date, hours, fares and how to
  buy tickets, the status section and FAQ, `content/projects.json` status → `completed`, and
  the regional `title`/`description`/`faq` in `content/guides/i18n/*.json`.
  **Use the playbook:** the "now open" text is pre-written in all 13 locales in
  `content/playbooks/varanasi-ropeway-open.json`. Check its sentences against the opening news
  (edit English and Hindi there first if anything differs, and list that under "Translations
  flagged"), then run `node scripts/apply-ropeway-open.mjs --date YYYY-MM-DD --hours "HH:MM–HH:MM"
  --source-url … --source-title "…" [--fare-min ₹N --fare-full ₹N [--fares-official]]` (try
  `--dry-run` first). It updates the guide in every locale, appends two FAQs and marks the
  project completed. Do by hand what it prints: the `fares` section once the operator publishes
  a fare table, and the project's summary, timeline and bestTime. Wait for the hours and the
  date from a source; never guess them.
- Varanasi airport (`varanasi-airport.json`): the lounge's name, hours and location (Priority
  Pass listing, AAI Eat & Dine page) and whether Varanasi is still on the bank lounge lists
  cited there (SBI Card, IndusInd, DBS, RuPay); replace a list with its newer quarterly copy.
  A walk-in price stays `"unconfirmed": true` until the lounge or AAI publishes one. Never
  claim a particular card (including Scapia) works there unless its own lounge list says so.
  When the new terminal opens, update the flights section, the facts and `airport-expansion`.
  The lounge review (`lounge-review` section, the "Card visit" and "Verdict" facts) rests on the
  owner's own 2026 visit and on other cardholders' reviews (thread URLs in the guide's `notes`).
  Never name or link that forum on the page (owner's request), and never write other people's
  details as our own experience. Once a month, read the thread's newest posts and the Priority
  Pass conditions; keep the verdict unless reviews show a real change (a new operator, a real
  buffet, free tea again) and then flag it under "Needs a human look". Never put "buffet" back
  on the Priority Pass listing's word alone.
- Currency exchange (`currency-exchange-in-varanasi.json`): RBI limits (FAQ "Miscellaneous
  forex facilities", Money Changing Master Direction) whenever the RBI updates them; the
  Thomas Cook Nadesar outlet and Unimoni branch still open; the airport counter stays
  `"unconfirmed": true` until AAI or the operator lists one; UPI One World availability for
  tourists. Name no card brand in the body (the house ad sits after `going-abroad`).
- Flights (`flights-to-varanasi.json`): new or dropped routes from Varanasi (airline
  announcements, news) on every run; nonstop durations and daily counts at each schedule
  change (summer from late March, winter from late October) and whenever a route is added.
  Never print fares (they change daily). Update the airport guide's flights section the same run.
- Sarnath: ASI ticket fees, Sarnath Museum hours and closed day, transport fares.
- Detail sections (visitor sections in `content/details/en.json` and `content/details/hi.json`, keyed by kind and id; tips stay on the entry): treat them like the summary. A changed fact is changed in English and Hindi together, with its source added to the entry's `sources`; list the entry under a dated heading in `TRANSLATION_REVIEW.md` for the regional locales (`content/details/<locale>.json` is not edited).
- Dev Deepawali: this year's date, official programme (lamp counts, laser/firework shows),
  boat rules and traffic advisories once announced.
- New Year (`new-year-in-varanasi-2027.json`): from 15 December 2026 on every run, search District
  and BookMyShow ("new year party varanasi", "NYE varanasi") and local news for 31 December
  parties: replace the 2025 example in the `parties-events` section, the "Parties" fact and FAQ 8
  with this year's venues and ticket prices once listed (a listing or press release is enough for
  a price, labelled as such; never invent one). From about 20 December, add the temple trust's
  New Year darshan notice (VIP/sparsh/Sugam suspension, booking halt) and the police traffic and
  boat orders to `temple-rules`, `traffic` and the facts the same run they are reported. These
  are top search days ("new year party in varanasi", "is kashi vishwanath open on 1 january").
Keep each section's `sources` indexes correct when you add or remove a source.

### 4. New developments
Look for significant news from Varanasi since the last review: places newly opened to the
public, new or re-scoped government projects. Propose an addition only with at least one
official or major-news source. Small additions (a new project, a new source) may be made
directly in the JSON following the existing entries' shape; a new place page is a proposal in
the summary only.

### 4b. Upcoming major events — write a guide for each (every run)
Search, in English and Hindi, for big events in or around Varanasi in the next six weeks that
many people will search for: air shows and military displays, VIP and PM visits with public
programmes, large cultural festivals and concerts (Ganga Mahotsav, Dev Deepawali programmes,
Kashi Tamil Sangamam, Ramnagar Ramlila), sports events, big religious gatherings, major
openings (the ropeway, a stadium). Useful queries: "Varanasi <month> <year> event", "वाराणसी
<महीना> कार्यक्रम", "Namo Ghat event", "Varanasi traffic advisory", "Varanasi air show".

For each event confirmed by at least one official source or two major news outlets, and not
already covered by a guide (check `content/guides/`):
- Write `content/guides/<event-slug>-<year>.json` in the same shape as
  `content/guides/varanasi-air-show-2026.json` (the model to copy), including the `event` object
  (`name_en/hi` including the year, `startDate`, `endDate`, optional `days`, `location_en/hi`, `lat`, `lng` from
  `content/places.json`, `free`, `organizer` {name, url of the organiser's official site} and
  `performers` [names] when known — Google's event results use them). The site shows "Upcoming / On now / Took place" and Event
  structured data from it automatically.
- Keyword research first: see what people actually type with Google's autocomplete, in
  English and Hindi, for the event's main phrases (one URL per command), e.g.
  `curl -s -G https://suggestqueries.google.com/complete/search --data-urlencode client=firefox --data-urlencode hl=hi --data-urlencode gl=in --data-urlencode "q=varanasi air show"`
  (also "<name> time", "<name> pass", "<venue> <name>", and the Hindi phrase). Build the title,
  section headings and FAQ questions from the most frequent wordings (typically: time, date,
  ticket price, pass / "pass kaise milega", live, venue name). Note the queries used in `notes`.
- SEO: the title starts with the phrase people search and covers the top intents ("Varanasi Air
  Show 2026: Time, Ticket Price, Pass & Live"), ≤ 60 characters; the description ≤ 158
  characters names dates, place and the main answers (e.g. the time, "free").
- During and after each show day, update the facts with what actually happened (real start
  and end times, changes to the schedule) — "time" searches peak on the day.
- Answer what visitors need: dates and timings (mark unannounced times as not confirmed),
  where and how to watch or attend, **passes and tickets — who issues them, whether they are
  free, and a clear warning about fake or paid "passes" and unofficial booking sites**, traffic
  and parking, rules (drones, boats, items), safety, and 6–8 FAQs in the words people search.
- Sources: official notices first, then major news; never cite unofficial look-alike event
  sites as official. English + Hindi in the file, and all 11 regional translations (rule 4).
- Put the event at the top of the summary table.

- **Lead time:** big dated festivals that people search months ahead (Maha Shivratri, Masan Holi
  and Holi, Ravidas Jayanti, Dev Deepawali, Sawan) need their guide **8–10 weeks** before the date,
  not six, so it is indexed before searches peak. Openings with a ticket or first-match moment
  (the Ganjari cricket stadium, the ropeway) get a guide as soon as the opening is reported, and
  the ticket section is filled the day sales are announced: ticket and pass searches drove the
  air show's 1,100 clicks a day.

### 4d. Keyword sweep for events already covered (every run)
For every guide with an `event` block, and every festival in `content/festival-dates.json`, whose
date is in the next 8 weeks: run the autocomplete check above in English and Hindi for "<event>
<year>", "<event> kab hai", "date", "time", "ticket / pass / booking", "cruise / boat booking",
"live", "route", "parking", and the Hindi name. For each wording people really type that the page
does not answer, add the phrase to the title or description if it is a top intent, or add an FAQ
(`q` in the searcher's words, sourced answer) or a section. **Append** new sections and FAQs at the
end: guide translations are matched by position, so inserting in the middle misaligns every
regional file; translate what you appended into all 11 regional files (rule 4). Never answer with
an unconfirmed fact: say it has not been announced yet and when it usually is. List the phrases
added under "Re-verified, no change" or in the summary.

### 4c. Finished events — turn them into history (every run)
For every guide whose `event.endDate` is before today and that has no `what-happened` section:
append a section `what-happened` at the end ("What happened at …" / "… में क्या हुआ"; at the end because translations are matched by position, see 4d) with a short,
sourced account (attendance, highlights, records, anything that went wrong), change the lead's
tense to the past, keep the practical sections that still help (for the next edition), update
`updated`, and translate the new section into all regional files. Do not delete event pages.

**Next year's guide straight after a big annual festival.** When a festival that people search a
year ahead has just ended (Dev Deepawali, Maha Shivratri, Masan Holi, Ganga Dussehra), write next
year's guide in the same run as the `what-happened` section, using the verified date in
`content/festival-dates.json` (Dev Deepawali 2027: 13 November 2027) and the structure of this
year's guide: date and timing, what happens, ghats, boats, crowds, stay, FAQs written from
autocomplete ("<festival> <next year> date / kab hai / varanasi / boat booking"). Mark anything
not yet announced for next year as `"unconfirmed": true`, link the two guides both ways
(`related.guides`), and translate it into all regional files. A guide that is a year old by the
festival ranks far better than one written a few weeks before.
Cover the whole keyword family, not just the date: why it is celebrated (the story), how it
differs from related festivals, muhurat / timing, best ghat or place to watch, how many days,
live / show timings, boat booking and packages, crowd and parking (for Dev Deepawali the
24 Nov 2026 guide's FAQs are the checklist). Skip wishes, quotes, status, rangoli and image
queries: greeting content is not what this site is for.

### 5. Links and photos
- Run `node scripts/check-links.mjs` first (one command, about 2 minutes): it checks every
  source URL in `content/*.json` and `content/guides/*.json` and lists the broken ones with the
  files they are in. Do not write your own link-checking loops. Re-check each reported link
  once yourself (`curl -sIL --max-time 20 -o /dev/null -w "%{http_code}" <url>`, one URL per
  command) before acting, since "no response" can be temporary. A dead link (4xx other than 403/429, or no response twice) is replaced with a working
  source for the same fact, or removed if the fact has another source; report it either way.
- For places, festivals and projects without a photo (no key in `content/photos.json`), search
  Wikimedia Commons (English, Hindi and alternate spellings; categories; geosearch) for a
  freely licensed photo (CC0, CC BY, CC BY-SA or public domain; not NC/ND) that really shows
  the subject. Do not add photos yourself — list candidates (file title, licence, why it is the
  right subject) in the summary for the maintainer.

### 6. Blog post — "Kashi A to Z" (`blog` focus, weekly)
One post a week on the history and stories of Kashi: ghats, temples, festivals and the city.
Posts live at `/blog/<slug>`, are fully automatic (no human reads them before they go live),
and so must be at least as careful as a guide. Budget: aim to finish in ~90 turns.

1. **Pick the topic:** the first entry in `content/blog/calendar.json` with `"status": "todo"`
   whose `notBefore` (if any) is on or before today. Festival stories carry a `notBefore` so
   they go out 3–5 weeks before the festival; skip entries that are not due yet.
2. **Keyword research first** (one autocomplete URL per command, hl=en and hl=hi, gl=in) for the
   calendar entry's `queries` and "<topic> history", "… story", "… history in hindi", "… kisne
   banwaya", "… name meaning". Title: the phrase people search first, ≤ 60 characters
   ("Manikarnika Ghat History & Story: Legends, Fire, Rituals"); description ≤ 158 characters.
   Headings and 6–10 FAQs use the searched wordings. Record the queries in `notes`.
3. **Research ≥ 3 reliable sources** (rule 3), plus scholarly ones where history is concerned:
   published histories of Banaras (cite them; never copy), archive.org scans of old records,
   the Kashi Khanda / Puranas for tradition. Never copy wording; never use blogs alone.
4. **Write tradition and history separately and say which is which:** "According to the Kashi
   Khanda…", "Tradition holds…" for legend; "Records show…", "In 1791…" for history, each with
   its source. Where sources disagree, say so. Verses: original script + transliteration +
   translation, only when the exact text is verified from a reliable source.
5. **Shape:** copy `content/blog/manikarnika-ghat-history.json` (the model). 5–8 sections of
   1–3 paragraphs (1,200–1,800 words in English), `facts` (4–6), FAQ 6–10, `sources` with
   `accessed` dates and per-section `sources` indexes, `photo` an existing key from
   `content/photos.json` (never a new image; never a photo of a cremation), `letter`, `topic`
   (`{"kind": "places"|"festivals", "id": …}` when the post is about one page), `related`
   (that page and 1–3 neighbours, `guides` where a guide helps the visitor), `published` and
   `updated` = today. Put `"promo": true` on the one practical "visiting today" section.
6. **Respect:** every faith with equal care and its own terms; no ranking; nothing voyeuristic
   about cremation, death or the Aghor tradition; no sensational "horror story" framing (answer
   such searches with facts); no claims about miracles as fact.
7. **13 languages:** English and Hindi in the post file, then all 11 regional translations in
   `content/guides/i18n/<locale>.json` under the post's slug, with exactly the same counts
   (rule 4). Validate every JSON file you touched with `python3 -m json.tool`.
8. **Mark the calendar entry** `"status": "done"`, `"slug"` and `"published"`. If the sources are
   too thin for a careful post, set `"status": "skipped"` with a `"reason"`, take the next entry,
   and say so in the summary. When fewer than 6 `todo` entries remain, append new ones (same
   fields) from autocomplete research on Kashi's ghats, temples and festivals, keeping the
   faiths balanced over time.
9. Summary (`.content-review-pr.md`): the post's title and URL `/en/blog/<slug>`, the queries
   targeted, sources used, anything uncertain left out.

## Before you finish

Validate every JSON file you touched with `python3 -m json.tool`. CI runs `npm run build`,
`npm run lint` and `node scripts/check-seo.mjs` on the pull request. New Hindi heading text
can fail the build's heading-font check: prefer existing spellings, and mention any new Hindi
heading under "Needs a human look" so the maintainer can rebuild the font subset if needed.

## Output

Write the pull-request body to `.content-review-pr.md` in the repository root (the script
moves it out before committing and uses it as the PR description). Plain language, in English:

```
## <Daily|Monthly> content review <date> — focus: <focus>

<two or three sentences: what was checked and the headline changes>

| What | Old → New | Source | Confidence |
|---|---|---|---|
| Ropeway: status | Under construction → Open (15 Nov 2026) | [PIB, 15 Nov 2026](https://…) | High — official |

### Search Console keyword pass
| Page | Top query (impressions, CTR, position) | Old → new title / description | Why |
|---|---|---|---|
| /hi/places/kaal-bhairav | shri kaal bhairav mandir varanasi timings (96, 0%, 9.3) | "…" → "…" | title had no timings |

<pages looked at with no change, and why; drops and overlaps go under "Needs a human look">

### Re-verified, no change
<list of entries whose lastVerified moved to today>

### Needs a human look
<anything uncertain, conflicting sources, heading-font rebuild needed, …>

### Broken links
<url → replacement, or removed>

### Photo candidates
<Commons file, licence, subject>

### Translations flagged
<entries added to TRANSLATION_REVIEW.md>

### Run notes
<focus; which checks were completed in full, which only partly and why (turn limit,
a tool that was not allowed, a site that blocked requests); what is left for the next run;
counts: projects re-verified, festivals checked, guides checked, links checked, broken links;
turns used (your count). The script appends the model, turns and estimated cost reported by
Claude Code below this section.>
```

Confidence is **High** (official source), **Medium** (one major-news source) or **Low**
(conflicting reports — in that case the change should normally not be made; list it under
"Needs a human look" instead). If nothing changed, say so and list what was re-verified.

Do not commit, push, create branches or open pull requests yourself — the script does that.
