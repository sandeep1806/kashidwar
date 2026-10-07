#!/usr/bin/env python3
"""Google Search Console report for kashidwar.com (read-only).

Usage:
  GSC_CREDENTIALS=/path/to/service-account.json python3 scripts/gsc-report.py [--days 28] [--inspect N]

Needs: pip install google-api-python-client google-auth requests
The service account (client_email in the key file) must be added as a user on the
Search Console property (Settings → Users and permissions → Add user, "Full" is enough).

Reports: sitemaps known to Google and their status, search performance for the last
--days days (totals, by country, by page, by query, hi vs en), and URL Inspection
(index status, canonical, last crawl) for the home pages and the first --inspect
sitemap URLs. URL Inspection is limited to 2,000 calls a day per property.
"""
import argparse, os, sys, json
from datetime import date, timedelta

SITE = os.environ.get("GSC_SITE", "sc-domain:kashidwar.com")
ORIGIN = "https://kashidwar.com"
KEY = os.environ.get("GSC_CREDENTIALS")

def service():
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    if not KEY or not os.path.exists(KEY):
        sys.exit("Set GSC_CREDENTIALS to the service-account JSON key path.")
    creds = service_account.Credentials.from_service_account_file(
        KEY, scopes=["https://www.googleapis.com/auth/webmasters.readonly"])
    return build("searchconsole", "v1", credentials=creds, cache_discovery=False), creds.service_account_email

def query(svc, body):
    return svc.searchanalytics().query(siteUrl=SITE, body=body).execute().get("rows", [])

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=28)
    ap.add_argument("--inspect", type=int, default=10, help="sitemap URLs to inspect (0 to skip)")
    ap.add_argument("--json", help="also write the raw results to this file")
    a = ap.parse_args()
    svc, email = service()
    from googleapiclient.errors import HttpError
    out = {"site": SITE, "generated": date.today().isoformat()}

    # Access check
    try:
        sites = {s["siteUrl"]: s["permissionLevel"] for s in svc.sites().list().execute().get("siteEntry", [])}
    except HttpError as e:
        sys.exit(f"Search Console API error: {e}")
    if SITE not in sites:
        print(f"The service account {email} cannot see {SITE}.")
        print("Properties it can see:", ", ".join(sites) or "none")
        print("\nFix: Search Console → kashidwar.com → Settings → Users and permissions → Add user →")
        print(f"  {email}  (permission: Full). Wait a few minutes, then rerun.")
        sys.exit(2)
    print(f"Property {SITE} · permission {sites[SITE]} · as {email}\n")

    # Sitemaps
    sm = svc.sitemaps().list(siteUrl=SITE).execute().get("sitemap", [])
    out["sitemaps"] = sm
    print("== Sitemaps ==")
    if not sm:
        print("  none submitted")
    for s in sm:
        contents = s.get("contents", [])
        subm = sum(int(c.get("submitted", 0)) for c in contents)
        idx = sum(int(c.get("indexed", 0)) for c in contents)
        print(f"  {s['path']}\n    last submitted {s.get('lastSubmitted','?')[:10]} · last read {s.get('lastDownloaded','?')[:10]}"
              f" · URLs {subm} · indexed {idx} · errors {s.get('errors',0)} · warnings {s.get('warnings',0)}"
              + ("  PENDING" if s.get("isPending") else ""))

    # Performance
    end = date.today() - timedelta(days=2)   # GSC data lags ~2 days
    start = end - timedelta(days=a.days)
    rng = {"startDate": start.isoformat(), "endDate": end.isoformat()}
    tot = query(svc, {**rng})
    print(f"\n== Performance {start} → {end} ==")
    if tot:
        r = tot[0]
        print(f"  clicks {r['clicks']:.0f} · impressions {r['impressions']:.0f} · CTR {r['ctr']*100:.1f}% · avg position {r['position']:.1f}")
    else:
        print("  no search data yet")
    out["totals"] = tot

    def top(dim, n, label, fmt=lambda k: k):
        rows = query(svc, {**rng, "dimensions": [dim], "rowLimit": n})
        out[dim] = rows
        if rows:
            print(f"\n  Top {label}:")
            for r in rows:
                print(f"    {r['clicks']:5.0f} clicks {r['impressions']:7.0f} impr  pos {r['position']:5.1f}  {fmt(r['keys'][0])}")
        return rows
    top("country", 8, "countries")
    pages = top("page", 15, "pages", lambda k: k.replace(ORIGIN, ""))
    top("query", 15, "queries")

    if pages:
        by_locale = {}
        for r in query(svc, {**rng, "dimensions": ["page"], "rowLimit": 1000}):
            seg = r["keys"][0].replace(ORIGIN, "").split("/")
            loc = seg[1] if len(seg) > 1 and len(seg[1]) == 2 else "(root)"
            d = by_locale.setdefault(loc, {"clicks": 0, "impressions": 0, "pages": 0})
            d["clicks"] += r["clicks"]; d["impressions"] += r["impressions"]; d["pages"] += 1
        out["by_locale"] = by_locale
        print("\n  By locale (pages with impressions):")
        for loc, d in sorted(by_locale.items(), key=lambda x: -x[1]["impressions"]):
            print(f"    /{loc:<6} {d['pages']:4d} pages  {d['clicks']:5.0f} clicks {d['impressions']:7.0f} impr")

    # URL inspection
    if a.inspect:
        urls = [f"{ORIGIN}/hi", f"{ORIGIN}/en"]
        try:
            import requests
            from xml.etree import ElementTree as ET
            ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            root = ET.fromstring(requests.get(f"{ORIGIN}/sitemap.xml", timeout=20).content)
            for loc in root.findall(".//s:loc", ns):
                if loc.text not in urls:
                    urls.append(loc.text)
                if len(urls) >= 2 + a.inspect:
                    break
        except Exception as e:
            print(f"\n(sitemap fetch failed: {e})")
        print(f"\n== URL inspection ({len(urls)} URLs) ==")
        insp = []
        for u in urls:
            try:
                res = svc.urlInspection().index().inspect(body={"inspectionUrl": u, "siteUrl": SITE}).execute()
                st = res["inspectionResult"]["indexStatusResult"]
                row = {"url": u, "verdict": st.get("verdict"), "coverage": st.get("coverageState"),
                       "lastCrawl": (st.get("lastCrawlTime") or "")[:10], "googleCanonical": st.get("googleCanonical"),
                       "userCanonical": st.get("userCanonical"), "robots": st.get("robotsTxtState"), "indexing": st.get("indexingState")}
                insp.append(row)
                canon = "" if row["googleCanonical"] in (None, u) else f"  google canonical → {row['googleCanonical']}"
                print(f"  {row['verdict']:<8} {row['coverage']:<45} crawl {row['lastCrawl'] or 'never':<10} {u.replace(ORIGIN,'')}{canon}")
            except HttpError as e:
                print(f"  ERROR    {u}: {e.status_code if hasattr(e,'status_code') else e}")
        out["inspection"] = insp

    if a.json:
        with open(a.json, "w") as f:
            json.dump(out, f, indent=2, default=str)
        print(f"\nRaw results → {a.json}")

if __name__ == "__main__":
    main()
