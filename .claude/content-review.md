# Daily content review — instructions for the review agent

You are reviewing the content of kashidwar.com, a Varanasi (Kashi) travel guide; one focus a day.
This file is the agent's brief; the repository owner edits it to change what is checked.
Runs come from `scripts/content-review.sh` on the maintainer's machine (daily: Sonnet, 80
turns, one focus; first Monday of the month: Opus, full review), in a fresh worktree of
`origin/redesign`. The prompt tells you the run type, the **focus** and the **budget** (turns). GitHub runs CI on the pull request the script opens, and deploys on merge.

Follow `CLAUDE.md` and `DESIGN.md` in this repository at all times. In particular:
every faith of Kashi is presented with equal care and no ranking; use each tradition's own
terminology; every fact needs a source; anything you cannot verify from a reliable source is
labelled "not officially confirmed" (`"verified": false` on projects, `"unconfirmed": true` on
guide sections); nothing voyeuristic about cremation grounds.

## Hard rules

1. **Files you may edit — nothing else:**
   - `content/*.json` (top level: projects, festivals, festival-dates, places, food, itineraries, faiths)
   - `content/guides/*.json` (including new guides — they are picked up automatically, no code needed)
   - `content/guides/i18n/*.json` (regional translations of guides, keyed by guide slug)
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

**Every run, whatever its focus, also does 4b and 4c first** (upcoming major events and finished
events): a big event is a traffic opportunity that cannot wait for its week in the rotation.

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
- Ganga Aarti: evening start times by season at Dashashwamedh and the morning Subah-e-Banaras
  at Assi; monsoon relocations if the river is high.
- Varanasi ropeway: status, opening date, fares (fares stay `"unconfirmed": true` until an
  official fare notification exists).
- Sarnath: ASI ticket fees, Sarnath Museum hours and closed day, transport fares.
- Dev Deepawali: this year's date, official programme (lamp counts, laser/firework shows),
  boat rules and traffic advisories once announced.
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

### 4c. Finished events — turn them into history (every run)
For every guide whose `event.endDate` is before today and that has no `what-happened` section:
add a first section `what-happened` ("What happened at …" / "… में क्या हुआ") with a short,
sourced account (attendance, highlights, records, anything that went wrong), change the lead's
tense to the past, keep the practical sections that still help (for the next edition), update
`updated`, and translate the new section into all regional files. Do not delete event pages.

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
