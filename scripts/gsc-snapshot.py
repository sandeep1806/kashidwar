#!/usr/bin/env python3
"""Search Console snapshot for the content review agent (read-only).

  GSC_CREDENTIALS=/path/key.json python3 scripts/gsc-snapshot.py --out .review-tmp/gsc.json \
      [--focus places --ids "assi-ghat, kaal-bhairav"] [--days 28]

Writes one JSON file the review agent reads instead of calling Google itself:
  focus          today's pages (by --focus / --ids), most missed clicks first, each with
                 its top queries, the content file that holds its title, and flags
  opportunities  site-wide query+page pairs on page 1–2 with a CTR far below the position's norm
  drops          pages whose position or impressions fell sharply in the last 14 days vs the 14 before
  overlaps       queries where two of our pages in the same language split the impressions
The key never reaches the agent: scripts/content-review.sh runs this before the agent starts.
Needs: pip install google-api-python-client google-auth
"""
import argparse, json, os, re, sys
from collections import defaultdict
from datetime import date, timedelta

ORIGIN = "https://kashidwar.com"
SITE = os.environ.get("GSC_SITE", f"{ORIGIN}/")

# Rough CTR a result normally gets at a position (same curve as gsc-report.py).
def expected_ctr(pos):
    return 0.30 if pos < 2 else 0.15 if pos < 3 else 0.10 if pos < 5 else 0.05 if pos < 8 else 0.03 if pos < 11 else 0.01

FOCUS_SECTIONS = {
    "places": ["places"], "festivals": ["festivals"], "guides": ["guides"],
    "developments": ["projects", "guides"], "projects": ["projects"],
    "full": ["places", "festivals", "guides", "projects", "blog"], "blog": ["blog"],
}

def where_title_lives(section, ident, locale):
    """Which content file and fields hold this page's search title, for the agent."""
    if section in ("guides", "blog"):
        base = f"content/{'guides' if section == 'guides' else 'blog'}/{ident}.json"
        if locale in ("en", "hi"):
            return {"file": base, "fields": [f"title_{locale}", f"description_{locale}", "faq"], "editable": True}
        return {"file": f"content/guides/i18n/{locale}.json", "fields": [f"{ident}.title", f"{ident}.description", f"{ident}.faq"], "editable": True}
    if section == "places":
        if locale == "en":
            return {"file": "content/places.json", "fields": [f"{ident}.seoTitle", f"{ident}.seoDescription"], "editable": True}
        if locale == "hi":
            return {"file": "content/places.json", "fields": [f"{ident}.i18n.hi.seoTitle", f"{ident}.i18n.hi.seoDescription"], "editable": True}
        return {"file": None, "fields": [], "editable": False, "why": "regional place titles live outside the files the review may edit"}
    if section == "festivals":
        return {"file": None, "fields": [], "editable": False, "why": "festival titles come from a fixed template (name, year, date); suggest wording under 'Needs a human look'"}
    return {"file": None, "fields": [], "editable": False, "why": f"{section} titles are not content-file fields"}

def parse(url):
    path = re.sub(r"[?#].*$", "", url.replace(ORIGIN, "")) or "/"
    parts = [p for p in path.split("/") if p]
    loc = parts[0] if parts else ""
    section = parts[1] if len(parts) > 1 else ""
    ident = parts[2] if len(parts) > 2 else ""
    return path, loc, section, ident

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--focus", default="full")
    ap.add_argument("--ids", default="", help="comma-separated ids (places focus)")
    ap.add_argument("--days", type=int, default=28)
    ap.add_argument("--queries", type=int, default=12, help="top queries kept per page")
    a = ap.parse_args()

    key = os.environ.get("GSC_CREDENTIALS")
    if not key or not os.path.exists(key):
        sys.exit("gsc-snapshot: GSC_CREDENTIALS is not set or the file is missing")
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    creds = service_account.Credentials.from_service_account_file(
        key, scopes=["https://www.googleapis.com/auth/webmasters.readonly"])
    svc = build("searchconsole", "v1", credentials=creds, cache_discovery=False)

    end = date.today() - timedelta(days=1)
    start = end - timedelta(days=a.days - 1)
    mid = end - timedelta(days=13)

    def rows(dims, s, e):
        out, start_row = [], 0
        while True:
            body = {"startDate": s.isoformat(), "endDate": e.isoformat(), "dimensions": dims,
                    "rowLimit": 25000, "startRow": start_row, "dataState": "all"}
            got = svc.searchanalytics().query(siteUrl=SITE, body=body).execute().get("rows", [])
            out += got
            if len(got) < 25000:
                return out
            start_row += 25000

    pq = rows(["page", "query"], start, end)
    pages_now = {parse(r["keys"][0])[0]: r for r in rows(["page"], mid, end)}
    pages_before = {parse(r["keys"][0])[0]: r for r in rows(["page"], start, mid - timedelta(days=1))}

    pages = defaultdict(lambda: {"impressions": 0, "clicks": 0, "posw": 0.0, "queries": []})
    for r in pq:
        path = parse(r["keys"][0])[0]
        p = pages[path]
        p["impressions"] += r["impressions"]; p["clicks"] += r["clicks"]; p["posw"] += r["position"] * r["impressions"]
        p["queries"].append({"q": r["keys"][1], "impressions": int(r["impressions"]), "clicks": int(r["clicks"]),
                             "ctr": round(r["ctr"], 4), "position": round(r["position"], 1)})

    def missed(q):  # clicks the query would get at the normal CTR for its position, minus what it got
        return max(0.0, q["impressions"] * expected_ctr(q["position"]) - q["clicks"])

    sections = FOCUS_SECTIONS.get(a.focus, FOCUS_SECTIONS["full"])
    ids = {i.strip() for i in a.ids.split(",") if i.strip()}
    focus = []
    for path, p in pages.items():
        _, loc, section, ident = parse(path)
        if section not in sections or not ident:
            continue
        if ids and section == "places" and ident not in ids:
            continue
        if p["impressions"] < 20:
            continue
        qs = sorted(p["queries"], key=lambda q: -q["impressions"])
        flags = []
        if any(q["position"] <= 3 and q["impressions"] >= 30 and q["clicks"] == 0 and re.search(r"kab|कब|date|when|तारीख|tithi|तिथि", q["q"]) for q in qs[:5]):
            flags.append("answered-in-google: top date questions rank 1–3 with no clicks; promise more than the date (timings, booking, route, fares)")
        now, before = pages_now.get(path), pages_before.get(path)
        if now and before and before["impressions"] >= 50 and (now["position"] - before["position"] >= 5 or now["impressions"] < before["impressions"] * 0.4):
            flags.append(f"dropped: position {before['position']:.1f} → {now['position']:.1f}, impressions {before['impressions']:.0f} → {now['impressions']:.0f} (14 days vs the 14 before)")
        focus.append({
            "page": path, "locale": loc, "section": section, "id": ident,
            "impressions": int(p["impressions"]), "clicks": int(p["clicks"]),
            "ctr": round(p["clicks"] / p["impressions"], 4) if p["impressions"] else 0,
            "position": round(p["posw"] / p["impressions"], 1) if p["impressions"] else None,
            "missedClicks": round(sum(missed(q) for q in qs), 1),
            "titleLivesIn": where_title_lives(section, ident, loc),
            "flags": flags,
            "topQueries": qs[: a.queries],
        })
    focus.sort(key=lambda x: -x["missedClicks"])

    opportunities = sorted(
        ({"page": parse(r["keys"][0])[0], "query": r["keys"][1], "impressions": int(r["impressions"]),
          "clicks": int(r["clicks"]), "ctr": round(r["ctr"], 4), "position": round(r["position"], 1),
          "normalCtr": expected_ctr(r["position"])}
         for r in pq if r["impressions"] >= 30 and 3 <= r["position"] <= 20 and r["ctr"] < expected_ctr(r["position"]) / 2),
        key=lambda x: -x["impressions"])[:40]

    drops = []
    for path, before in pages_before.items():
        now = pages_now.get(path, {"impressions": 0, "clicks": 0, "position": 0})
        if before["impressions"] >= 100 and now["impressions"] < before["impressions"] * 0.4:
            drops.append({"page": path, "impressionsBefore": int(before["impressions"]), "impressionsNow": int(now["impressions"]),
                          "positionBefore": round(before["position"], 1), "positionNow": round(now["position"], 1) if now["position"] else None})
    drops.sort(key=lambda x: -(x["impressionsBefore"] - x["impressionsNow"]))

    byq = defaultdict(list)
    for r in pq:
        path, loc, section, ident = parse(r["keys"][0])
        byq[(loc, r["keys"][1])].append((path, int(r["impressions"]), round(r["position"], 1)))
    overlaps = sorted(
        ({"query": q, "locale": loc, "pages": [{"page": p, "impressions": i, "position": pos} for p, i, pos in sorted(v, key=lambda t: -t[1])]}
         for (loc, q), v in byq.items() if len(v) >= 2 and sum(i for _, i, _ in v) >= 50 and sorted((i for _, i, _ in v), reverse=True)[1] >= 10),
        key=lambda x: -sum(p["impressions"] for p in x["pages"]))[:25]

    out = {
        "generated": date.today().isoformat(), "site": SITE,
        "range": {"start": start.isoformat(), "end": end.isoformat(), "days": a.days},
        "focus": {"name": a.focus, "ids": sorted(ids), "pages": focus},
        "opportunities": opportunities, "drops": drops[:20], "overlaps": overlaps,
    }
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, "w") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"gsc-snapshot: {len(focus)} focus pages, {len(opportunities)} opportunities, {len(drops)} drops, {len(overlaps)} overlaps → {a.out}")

if __name__ == "__main__":
    main()
