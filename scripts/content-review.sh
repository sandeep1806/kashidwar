#!/usr/bin/env bash
# AI content review, run on the maintainer's machine with the local Claude Code CLI.
# GitHub checks the pull request (CI); the script merges it when CI passes, and GitHub
# deploys the merge without waiting for approval (deploy.yml recognises content-review
# merges). NO_MERGE=1 leaves the pull request open for a hand review instead.
#
#   scripts/content-review.sh                # today's rotation (see below)
#   scripts/content-review.sh guides         # one focus: projects | festivals | guides | developments | places
#   scripts/content-review.sh places 2       # places, quarter 2 of the A–Z list (1–4)
#   scripts/content-review.sh full           # the deep review (Opus)
#   DRY_RUN=1 scripts/content-review.sh ...  # review and show the diff, but no branch, push or PR
#   NO_MERGE=1 scripts/content-review.sh ... # open the pull request but leave it for a hand merge
#   FORCE=1 scripts/content-review.sh ...    # run even if today's review already exists
#
# Daily rotation by the weekday (IST): Monday = full monthly review on the first Monday
# (Opus, 150 turns), festivals + dates on the others · Tuesday–Friday = places, one quarter
# of the A–Z list each day (every place re-checked weekly: timings, fees, online/counter
# tickets, closures, sources) · Saturday guides' volatile facts · Sunday developments +
# projects + broken links + photos (Sonnet, 80 turns). Every run also writes guides for
# upcoming major events and turns finished events into history (brief, checks 4b and 4c).
# A run that changes no content opens no pull request; its report stays in the log folder.
# A run that changes content opens one pull request, waits for CI and merges it (the
# merge deploys the site); a CI failure leaves the pull request open and the run fails.
# No dollar cap by default; set REVIEW_MAX_BUDGET=<usd> for one. Override with
# REVIEW_MODEL / REVIEW_MAX_TURNS.
#
# The agent's brief is .claude/content-review.md. It works in a throwaway git worktree
# of origin/redesign (your checkout is never touched), may edit only content files, and
# the script — not the agent — commits, pushes, opens ONE pull request and merges it once
# CI is green. See README → "Content review".
set -euo pipefail

REPO=$(cd "$(dirname "$0")/.." && pwd)
STATE="${XDG_STATE_HOME:-$HOME/.local/state}/kashidwar-review"
mkdir -p "$STATE"
exec 9>"$STATE/lock"
flock -n 9 || { echo "Another content review is already running."; exit 0; }

TODAY=$(TZ=Asia/Kolkata date +%F)
DAY=$(TZ=Asia/Kolkata date +%-d)
DOW=$(TZ=Asia/Kolkata date +%u)   # 1 = Monday … 7 = Sunday
FOCUS="${1:-auto}"
SLICE="${2:-}"
if [ "$FOCUS" = auto ]; then
  case "$DOW" in
    1) if [ "$DAY" -le 7 ]; then FOCUS=full; else FOCUS=festivals; fi;;
    2|3|4|5) FOCUS=places; SLICE=$(( DOW - 1 ));;
    6) FOCUS=guides;;
    7) FOCUS=developments;;
  esac
fi
case "$FOCUS" in
  full) KIND=Monthly; MODEL=${REVIEW_MODEL:-claude-opus-5-5}; TURNS=${REVIEW_MAX_TURNS:-150};;
  projects|festivals|guides|developments|places) KIND=Daily; MODEL=${REVIEW_MODEL:-claude-sonnet-5}; TURNS=${REVIEW_MAX_TURNS:-80};;
  *) echo "Unknown focus '$FOCUS' (use auto, full, projects, festivals, guides, developments or places)"; exit 2;;
esac
if [ "$FOCUS" = places ]; then
  SLICE=${SLICE:-1}
  case "$SLICE" in 1|2|3|4) ;; *) echo "Places quarter must be 1–4"; exit 2;; esac
fi
BUDGET=${REVIEW_MAX_BUDGET:-}
BUDGET_ARGS=(); [ -n "$BUDGET" ] && BUDGET_ARGS=(--max-budget-usd "$BUDGET")
CAPS="${TURNS} turns$( [ -n "$BUDGET" ] && printf ', $%s cap' "$BUDGET" || true)"

# One review per day: a scheduled catch-up run after a manual one does nothing (FORCE=1 overrides).
if [ -z "${DRY_RUN:-}" ] && [ -z "${FORCE:-}" ] && [ -e "$STATE/${TODAY}.done" ]; then
  echo "Today's content review (${TODAY}) already ran; nothing to do (FORCE=1 runs another)."; exit 0
fi
if [ -z "${DRY_RUN:-}" ] && [ -z "${FORCE:-}" ] && git -C "$REPO" ls-remote --exit-code --heads origin "content-review/${TODAY}-*" >/dev/null 2>&1; then
  echo "A content review for ${TODAY} already exists on GitHub; nothing to do (FORCE=1 runs another)."; exit 0
fi

TAG="${FOCUS}${SLICE:+-$SLICE}"
LOG="$STATE/${TODAY}-${TAG}.log"
OUT="$STATE/${TODAY}-${TAG}.json"
echo "${KIND} content review ${TODAY} · focus ${TAG} · ${MODEL} · ${CAPS}" | tee "$LOG"

WT=$(mktemp -d "${TMPDIR:-/tmp}/kashidwar-review.XXXXXX")
BRANCH=""
cleanup() {
  git -C "$REPO" worktree remove --force "$WT" >/dev/null 2>&1 || rm -rf "$WT"
  # The review branch was created inside the worktree; drop the local copy once it is gone.
  [ -n "$BRANCH" ] && git -C "$REPO" branch -D "$BRANCH" >/dev/null 2>&1 || true
}
trap cleanup EXIT
git -C "$REPO" fetch -q origin redesign
git -C "$REPO" worktree add -q --detach "$WT" origin/redesign
cd "$WT"

SCOPE=""
if [ "$FOCUS" = places ]; then
  # Quarter N of the places sorted A–Z by English name: every place is re-checked once a week.
  IDS=$(SLICE="$SLICE" python3 -c 'import json,os
p=sorted(json.load(open("content/places.json")),key=lambda x:x["name_en"].lower())
n=int(os.environ["SLICE"]);q=-(-len(p)//4)
print(", ".join(x["id"] for x in p[(n-1)*q:n*q]))')
  SCOPE="
Places to review this run (quarter ${SLICE} of 4, A–Z): ${IDS}."
fi

PROMPT="Today is ${TODAY} (Asia/Kolkata). Run type: ${KIND}. Focus for this run: ${FOCUS}.${SCOPE}
Budget: at most ${TURNS} turns.
Read .claude/content-review.md and carry out the review it describes for this focus only,
following CLAUDE.md and DESIGN.md, and its budget rules (write the summary early, keep it
current, stop and finalise when about 80% of the turns are used). Edit only the files it
allows, keep the pull-request body in .content-review-pr.md, and do not commit, push or open
a pull request yourself."

ALLOWED="Read,Glob,Grep,Edit,MultiEdit,Write,WebSearch,WebFetch,TodoWrite,Bash(curl:*),Bash(grep:*),Bash(head:*),Bash(tail:*),Bash(wc:*),Bash(sort:*),Bash(uniq:*),Bash(awk:*),Bash(xargs:*),Bash(cat:*),Bash(ls:*),Bash(date:*),Bash(echo:*),Bash(sleep:*),Bash(mkdir:*),Bash(python3:*),Bash(jq:*),Bash(git diff:*),Bash(git status:*),Bash(node scripts/check-links.mjs:*)"
DENIED="Bash(git push:*),Bash(git commit:*),Bash(git checkout:*),Bash(git reset:*),Bash(gh:*),Bash(npm:*),Bash(npx:*),Bash(rm:*)"

# Project settings only (not your personal ~/.claude rules or hooks), no MCP servers:
# the review sees the repository and the web, nothing else.
COMMON=(--setting-sources project --strict-mcp-config --allowedTools "$ALLOWED" --disallowedTools "$DENIED" --output-format json)
set +e
claude -p "$PROMPT" --model "$MODEL" --max-turns "$TURNS" "${BUDGET_ARGS[@]}" "${COMMON[@]}" > "$OUT" 2>>"$LOG"
# Out of turns (or budget) without a summary: resume the same session for a few turns
# with one job — write the summary of what was checked — so partial work still becomes a PR.
SID=$(jq -r '.session_id // ""' "$OUT" 2>/dev/null)
SUB=$(jq -r '.subtype // ""' "$OUT" 2>/dev/null)
if [ -n "$SID" ] && { [ ! -s .content-review-pr.md ] || [[ "$SUB" == error_max_* ]]; }; then
  echo "Run ended at its cap (${SUB:-no result}); resuming the session to finalise the summary." | tee -a "$LOG"
  FIN="$STATE/${TODAY}-${TAG}-finalise.json"
  claude -p "Your review budget is used up. Stop checking now. Validate any JSON file you edited with python3 -m json.tool, then rewrite .content-review-pr.md as a FINAL report (no 'in progress' placeholders) exactly in the format the brief's Output section gives: what you checked, every change (old → new, source, confidence), what needs a human look, and under Run notes what was NOT reached this time. Do nothing else." \
    --resume "$SID" --model "$MODEL" --max-turns 6 --max-budget-usd 0.5 "${COMMON[@]}" > "$FIN" 2>>"$LOG"
  # Report the combined numbers.
  jq -s '.[0] as $a | .[1] as $b | $a + {num_turns: (($a.num_turns // 0) + ($b.num_turns // 0)), total_cost_usd: (($a.total_cost_usd // 0) + ($b.total_cost_usd // 0)), finalised: true}' "$OUT" "$FIN" > "$OUT.tmp" 2>/dev/null && mv "$OUT.tmp" "$OUT"
fi
set -e

RESULT_TYPE=$(jq -r '.subtype // ""' "$OUT" 2>/dev/null || true)
IS_ERROR=$(jq -r '.is_error // ""' "$OUT" 2>/dev/null || true)
TURNS_USED=$(jq -r '.num_turns // ""' "$OUT" 2>/dev/null || true)
COST=$(jq -r '.total_cost_usd // "" | if . == "" then "" else (. * 100 | round / 100 | tostring) end' "$OUT" 2>/dev/null || true)
FINAL=$(jq -r '.result // ""' "$OUT" 2>/dev/null | head -c 2000 || true)
echo "Result: ${RESULT_TYPE:-unknown} (error: ${IS_ERROR:-?}) · turns ${TURNS_USED:-?} · cost \$${COST:-?}" | tee -a "$LOG"
if [ -n "$FINAL" ]; then printf '%s\n' "$FINAL" | sed 's/^/> /' | tee -a "$LOG"; fi

# Only content files may change: stray new files are removed, edits elsewhere abort.
ALLOWED_PATHS='^(content/[^/]+\.json|content/guides/[^/]+\.json|content/guides/i18n/[^/]+\.json|TRANSLATION_REVIEW\.md|\.content-review-pr\.md)$'
git ls-files --others --exclude-standard | { grep -vE "$ALLOWED_PATHS" || true; } | while read -r f; do
  echo "Removed scratch file left by the review: $f" | tee -a "$LOG"; rm -f -- "$f"
done
git add -A
git reset -q -- .content-review-pr.md 2>/dev/null || true
CHANGED=$(git diff --cached --name-only)
BAD=$(printf '%s\n' "$CHANGED" | { grep -vE "$ALLOWED_PATHS" || true; } | sed '/^$/d')
if [ -n "$BAD" ]; then
  echo "ABORTED: the review changed files outside its allowed paths:" | tee -a "$LOG"; echo "$BAD" | tee -a "$LOG"; exit 1
fi
for f in $(printf '%s\n' "$CHANGED" | grep '\.json$' || true); do
  python3 -m json.tool "$f" > /dev/null || { echo "ABORTED: invalid JSON in $f" | tee -a "$LOG"; exit 1; }
done
if [ -z "$CHANGED" ] && [ ! -s .content-review-pr.md ]; then
  echo "ABORTED: the review produced neither changes nor a summary. See $LOG" | tee -a "$LOG"; exit 1
fi

# The pull-request body: the agent's summary plus this run's numbers.
BODY="$STATE/${TODAY}-${TAG}-pr.md"
if [ -s .content-review-pr.md ]; then cp .content-review-pr.md "$BODY"; rm -f .content-review-pr.md
else printf '## %s content review %s\n\n(The agent wrote no summary.)\n' "$KIND" "$TODAY" > "$BODY"; fi
case "$RESULT_TYPE" in
  error_max_turns) STOP="stopped at the turn cap (${TURNS}); partial review"
    if [ "$(jq -r '.finalised // false' "$OUT" 2>/dev/null)" = true ]; then STOP="$STOP, summary finalised in a short follow-up"; fi;;
  error_max_budget*) STOP="stopped at the dollar cap (\$${BUDGET}); partial review";;
  success) if [ "$IS_ERROR" = true ]; then STOP="ended with an error: ${FINAL:0:200}"; else STOP="completed"; fi;;
  *) STOP="ended: ${RESULT_TYPE:-unknown}";;
esac
{
  echo; echo "### Run cost (reported by Claude Code)"
  echo "- ${KIND} review, focus **${TAG}**, model \`${MODEL}\`: ${STOP}."
  echo "- Turns used: ${TURNS_USED:-?} of ${TURNS}. Estimated cost: \$${COST:-?}$( [ -n "$BUDGET" ] && printf ' (cap $%s)' "$BUDGET" || true)."
  if [ -n "${NO_MERGE:-}" ]; then
    echo "- Run on the maintainer's machine (scripts/content-review.sh). CI runs on this pull request; NO_MERGE was set, so it waits for a hand merge."
  else
    echo "- Run on the maintainer's machine (scripts/content-review.sh). CI runs on this pull request; the script merges it when CI passes and GitHub deploys the merge."
  fi
} >> "$BODY"

# One line per run in the review history.
TODAY="$TODAY" KIND="$KIND" TAG="$TAG" MODEL="$MODEL" TURNS_USED="$TURNS_USED" COST="$COST" RESULT_TYPE="$RESULT_TYPE" python3 - <<'PY'
import json, os, pathlib
p = pathlib.Path("content/review-log.json")
log = json.loads(p.read_text()) if p.exists() else []
cost = os.environ.get("COST") or None
turns = os.environ.get("TURNS_USED", "")
log.append({
    "date": os.environ["TODAY"], "kind": os.environ["KIND"], "focus": os.environ["TAG"],
    "model": os.environ["MODEL"], "turns": int(turns) if turns.isdigit() else None,
    "costUsd": float(cost) if cost else None, "result": os.environ.get("RESULT_TYPE") or None,
    "run": "local (scripts/content-review.sh)",
})
p.write_text(json.dumps(log, indent=2) + "\n")
PY
git add -A
git reset -q -- .content-review-pr.md 2>/dev/null || true

# Nothing but the review log changed: no pull request (a daily run usually finds nothing).
if [ -z "$(git diff --cached --name-only | grep -v '^content/review-log\.json$' || true)" ]; then
  echo "No content changes; no pull request. Report: $BODY" | tee -a "$LOG"
  [ -z "${DRY_RUN:-}" ] && touch "$STATE/${TODAY}.done"
  exit 0
fi

if [ -n "${DRY_RUN:-}" ]; then
  echo "DRY_RUN: not committing. Changes:"; git diff --cached --stat; echo "PR body: $BODY"; exit 0
fi

BRANCH="content-review/${TODAY}-${TAG}"
# A forced second run the same day gets its own branch.
if git -C "$REPO" ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then BRANCH="${BRANCH}-$(TZ=Asia/Kolkata date +%H%M)"; fi
git switch -q -c "$BRANCH"
git commit -q -m "${KIND} content review ${TODAY} (${TAG})"
git push -q origin "$BRANCH"
URL=$(cd "$REPO" && gh pr create --base redesign --head "$BRANCH" --title "${KIND} content review ${TODAY}" --body-file "$BODY")
echo "Opened ${URL}" | tee -a "$LOG"
cd "$REPO"
if [ -n "${NO_MERGE:-}" ]; then
  echo "NO_MERGE is set: the pull request waits for a hand merge." | tee -a "$LOG"; exit 0
fi

# Wait for CI (build, lint, SEO checks) on the pull request, then merge it. The merge is
# a push to redesign, which deploy.yml deploys without approval because the merge commit
# names the content-review branch. A red or stuck CI leaves the pull request open.
echo "Waiting for CI on ${URL} …" | tee -a "$LOG"
for _ in $(seq 1 30); do   # up to 5 minutes for GitHub to register the check run
  rc=0; gh pr checks "$URL" >/dev/null 2>&1 || rc=$?   # 0 = all passed, 8 = still running, else none yet
  if [ "$rc" -eq 0 ] || [ "$rc" -eq 8 ]; then break; fi
  sleep 10
done
if ! timeout 45m gh pr checks "$URL" --watch --fail-fast >>"$LOG" 2>&1; then
  echo "CI FAILED (or timed out) on ${URL}; left open for a hand review. See $LOG" | tee -a "$LOG"; exit 1
fi
gh pr merge "$URL" --merge >>"$LOG" 2>&1 || {
  echo "MERGE FAILED for ${URL}; left open for a hand review. See $LOG" | tee -a "$LOG"; exit 1
}
git push -q origin --delete "$BRANCH" >>"$LOG" 2>&1 || true
touch "$STATE/${TODAY}.done"
echo "Merged ${URL} into redesign; GitHub is deploying it (Actions → Deploy)." | tee -a "$LOG"
