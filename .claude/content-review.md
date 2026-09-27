# Weekly content review — instructions for the review agent

You are reviewing the content of kashidwar.com, a Varanasi (Kashi) travel guide, once a week.
This file is the agent's brief; the repository owner edits it to change what is checked.
Runs come from `.github/workflows/weekly-content-review.yml` (Sonnet, small budget, one
focus per week) and `.github/workflows/monthly-content-review.yml` (Opus, full review), both
through `content-review-run.yml`. The prompt tells you the run type, the **focus** and the
**budget** (turns and dollars).

Follow `CLAUDE.md` and `DESIGN.md` in this repository at all times. In particular:
every faith of Kashi is presented with equal care and no ranking; use each tradition's own
terminology; every fact needs a source; anything you cannot verify from a reliable source is
labelled "not officially confirmed" (`"verified": false` on projects, `"unconfirmed": true` on
guide sections); nothing voyeuristic about cremation grounds.

## Hard rules

1. **Files you may edit — nothing else:**
   - `content/*.json` (top level: projects, festivals, festival-dates, places, food, itineraries, faiths)
   - `content/guides/*.json`
   - `TRANSLATION_REVIEW.md`
   Never touch code, `package*.json`, config, scripts, `messages/`, `content/i18n/`, photos,
   workflows, `.claude/`, or secrets, and not `content/review-log.json` (the workflow writes it). The workflow rejects the run if any other path changes.
2. **Never copy text from news articles or other sites.** Read the source, then write an
   original, short summary in the site's voice (present tense, factual, no superlatives).
   Quoting official figures (dates, fares, timings, lengths) is fine.
3. **Sources:** prefer official ones (government departments and press releases — PIB, UP
   government, kashi.gov.in, varanasi.nic.in, VDA, NHAI, Indian Railways, AAI, ASI, UNESCO —
   temple trusts such as shrikashivishwanath.org), then major news (PTI, ANI, The Hindu, Indian
   Express, Times of India, Hindustan Times, Amar Ujala, Dainik Jagran, Aaj Tak, ETV Bharat, DD).
   A change needs at least one such source. Blogs and travel agencies never count on their own.
4. **Hindi and English together:** whenever you change English text, change the matching Hindi
   text in the same edit (`name_hi`, `*_hi`, `i18n.hi`), in natural Hindi. Other locales
   (`content/i18n/*.json` and each entry's `i18n.<locale>` other than `hi`) are NOT edited —
   list every affected entry under a new dated heading in `TRANSLATION_REVIEW.md` so a
   translator can update them.
5. **Dates:** today's date is given in the prompt. Keep ISO dates (`YYYY-MM-DD`). Never move a
   `lastVerified` date forward unless you actually re-checked that entry this run.
6. **When unsure, do not change it** — mention it in the summary as "needs a human look".
7. Keep JSON formatting as it is (the files use 2-space or 1-space indentation; match the file).

## Focus: what each run checks

The prompt names one focus. Do only the checks for that focus (numbers refer to the sections
under "What to check"):

| Focus | Checks | When |
|---|---|---|
| `projects` | 1 | weekly, week 1 of the month (and a 5th Monday) |
| `festivals` | 2, plus the festival pages' own facts in `content/festivals.json` | weekly, week 2 |
| `guides` | 3 | weekly, week 3 |
| `developments` | 4 and 5 | weekly, week 4 |
| `full` | 1–5 | monthly, first Monday |

Update a "last verified" date (`lastVerified` on projects, `updated` on guides, a festival
date's verification fields) **only for entries you actually re-checked in this run**.

## Budget: stop and report

Runs are capped (the prompt gives the turn and dollar limits; the run is cut off when it hits
either). Partial work is fine and still becomes a pull request, so:

1. After the first two or three entries, write `.content-review-pr.md` with the summary so far,
   and update it after every few entries. If the run is cut off, that file is the report.
2. Keep a running count of your turns. When about 80% of the turn budget is used (for example
   32 of 40), stop checking, validate the files you touched, and finalise the summary: list
   what was checked, and under "Run notes" what was **not** reached this time.
3. Prefer finishing fewer entries properly over touching many superficially. Start with the
   entries most likely to have changed (under-construction or announced projects, the next
   festivals, fares and timings).
4. Skip `npm run build` on weekly runs unless you changed dates or structure (CI builds the PR
   anyway); always validate JSON with `python3 -m json.tool`.

## Working method

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
public, major events, new or re-scoped government projects. Propose an addition only with at
least one official or major-news source. Small additions (a new project, a new source) may be
made directly in the JSON following the existing entries' shape; larger ones (a new place
page, a new guide) are proposals in the summary only.

### 5. Links and photos
- Check every URL in `sources` across `content/*.json` and `content/guides/*.json`
  (`curl -sIL --max-time 20 -o /dev/null -w "%{http_code}" <url>`; retry with GET if HEAD fails).
  A dead link (4xx other than 403/429, or no response twice) is replaced with a working
  source for the same fact, or removed if the fact has another source; report it either way.
- For places, festivals and projects without a photo (no key in `content/photos.json`), search
  Wikimedia Commons (English, Hindi and alternate spellings; categories; geosearch) for a
  freely licensed photo (CC0, CC BY, CC BY-SA or public domain; not NC/ND) that really shows
  the subject. Do not add photos yourself — list candidates (file title, licence, why it is the
  right subject) in the summary for the maintainer.

## Before you finish

Validate every JSON file you touched. On monthly runs (and weekly runs that changed dates or
structure) also run `npm run build`, `npm run lint` and `node scripts/check-seo.mjs` if the
budget allows — CI runs them on the pull request regardless. Fix any failure your edits
caused (for example invalid JSON or a date the SEO check rejects). If the build's heading-font
check fails because of new Hindi text, prefer existing spellings; otherwise report that the
heading-font subset must be rebuilt (a maintainer task).

## Output

Write the pull-request body to `.content-review-pr.md` in the repository root (the workflow
moves it out before committing and uses it as the PR description). Plain language, in English:

```
## <Weekly|Monthly> content review <date> — focus: <focus>

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
<focus; which checks were completed in full, which only partly and why (turn or budget limit,
a tool that was not allowed, a site that blocked requests); what is left for the next run;
counts: projects re-verified, festivals checked, guides checked, links checked, broken links;
turns used (your count). The workflow appends the model, turns and estimated cost reported by
Claude Code below this section.>
```

Confidence is **High** (official source), **Medium** (one major-news source) or **Low**
(conflicting reports — in that case the change should normally not be made; list it under
"Needs a human look" instead). If nothing changed, say so and list what was re-verified.

Do not commit, push, create branches or open pull requests yourself — the workflow does that.
