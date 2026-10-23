#!/usr/bin/env bash
# AI content review, run on the maintainer's machine with the local Claude Code CLI.
# GitHub only checks (CI on the pull request) and deploys (on merge).
#
#   scripts/content-review.sh                # this week's rotation (see below)
#   scripts/content-review.sh guides         # one focus: projects | festivals | guides | developments
#   scripts/content-review.sh full           # the deep review (Opus)
#   DRY_RUN=1 scripts/content-review.sh ...  # review and show the diff, but no branch, push or PR
#
# Rotation by the week of the month (IST): week 1 = full monthly review (Opus, 150 turns,
# $15) · week 2 festivals + dates · week 3 guides' volatile facts · week 4 developments +
# broken links + photos · 5th Monday projects (Sonnet, 40 turns, $3). Override with
# REVIEW_MODEL / REVIEW_MAX_TURNS / REVIEW_MAX_BUDGET.
#
# The agent's brief is .claude/content-review.md. It works in a throwaway git worktree
# of origin/redesign (your checkout is never touched), may edit only content files, and
# the script — not the agent — commits, pushes and opens ONE pull request. See README →
# "Content review".
set -euo pipefail

REPO=$(cd "$(dirname "$0")/.." && pwd)
STATE="${XDG_STATE_HOME:-$HOME/.local/state}/kashidwar-review"
mkdir -p "$STATE"
exec 9>"$STATE/lock"
flock -n 9 || { echo "Another content review is already running."; exit 0; }

TODAY=$(TZ=Asia/Kolkata date +%F)
DAY=$(TZ=Asia/Kolkata date +%-d)
WEEK=$(( (DAY - 1) / 7 + 1 ))
FOCUS="${1:-auto}"
if [ "$FOCUS" = auto ]; then
  case "$WEEK" in 1) FOCUS=full;; 2) FOCUS=festivals;; 3) FOCUS=guides;; 4) FOCUS=developments;; *) FOCUS=projects;; esac
fi
case "$FOCUS" in
  full) KIND=Monthly; MODEL=${REVIEW_MODEL:-claude-opus-5-5}; TURNS=${REVIEW_MAX_TURNS:-150}; BUDGET=${REVIEW_MAX_BUDGET:-15};;
  projects|festivals|guides|developments) KIND=Weekly; MODEL=${REVIEW_MODEL:-claude-sonnet-5}; TURNS=${REVIEW_MAX_TURNS:-40}; BUDGET=${REVIEW_MAX_BUDGET:-3};;
  *) echo "Unknown focus '$FOCUS' (use auto, full, projects, festivals, guides or developments)"; exit 2;;
esac

# One review per day: a scheduled catch-up run after a manual one does nothing.
if [ -z "${DRY_RUN:-}" ] && git -C "$REPO" ls-remote --exit-code --heads origin "content-review/${TODAY}-*" >/dev/null 2>&1; then
  echo "A content review for ${TODAY} already exists on GitHub; nothing to do."; exit 0
fi

LOG="$STATE/${TODAY}-${FOCUS}.log"
OUT="$STATE/${TODAY}-${FOCUS}.json"
echo "${KIND} content review ${TODAY} · focus ${FOCUS} · ${MODEL} · ${TURNS} turns · \$${BUDGET} cap" | tee "$LOG"

WT=$(mktemp -d "${TMPDIR:-/tmp}/kashidwar-review.XXXXXX")
cleanup() { git -C "$REPO" worktree remove --force "$WT" >/dev/null 2>&1 || rm -rf "$WT"; }
trap cleanup EXIT
git -C "$REPO" fetch -q origin redesign
git -C "$REPO" worktree add -q --detach "$WT" origin/redesign
cd "$WT"

PROMPT="Today is ${TODAY} (Asia/Kolkata). Run type: ${KIND}. Focus for this run: ${FOCUS}.
Budget: at most ${TURNS} turns and about \$${BUDGET}.
Read .claude/content-review.md and carry out the review it describes for this focus only,
following CLAUDE.md and DESIGN.md, and its budget rules (write the summary early, keep it
current, stop and finalise when about 80% of the turns are used). Edit only the files it
allows, keep the pull-request body in .content-review-pr.md, and do not commit, push or open
a pull request yourself."

ALLOWED="Read,Glob,Grep,Edit,MultiEdit,Write,WebSearch,WebFetch,TodoWrite,Bash(curl:*),Bash(grep:*),Bash(head:*),Bash(tail:*),Bash(wc:*),Bash(sort:*),Bash(uniq:*),Bash(awk:*),Bash(xargs:*),Bash(cat:*),Bash(ls:*),Bash(date:*),Bash(echo:*),Bash(sleep:*),Bash(mkdir:*),Bash(python3:*),Bash(jq:*),Bash(git diff:*),Bash(git status:*)"
DENIED="Bash(git push:*),Bash(git commit:*),Bash(git checkout:*),Bash(git reset:*),Bash(gh:*),Bash(npm:*),Bash(npx:*),Bash(rm:*)"

# Project settings only (not your personal ~/.claude rules or hooks), no MCP servers,
# no saved session: the review sees the repository and the web, nothing else.
set +e
claude -p "$PROMPT" \
  --model "$MODEL" --max-turns "$TURNS" --max-budget-usd "$BUDGET" \
  --setting-sources project --strict-mcp-config --no-session-persistence \
  --allowedTools "$ALLOWED" --disallowedTools "$DENIED" \
  --output-format json > "$OUT" 2>>"$LOG"
set -e

RESULT_TYPE=$(jq -r '.subtype // ""' "$OUT" 2>/dev/null || true)
IS_ERROR=$(jq -r '.is_error // ""' "$OUT" 2>/dev/null || true)
TURNS_USED=$(jq -r '.num_turns // ""' "$OUT" 2>/dev/null || true)
COST=$(jq -r '.total_cost_usd // "" | if . == "" then "" else (. * 100 | round / 100 | tostring) end' "$OUT" 2>/dev/null || true)
FINAL=$(jq -r '.result // ""' "$OUT" 2>/dev/null | head -c 2000 || true)
echo "Result: ${RESULT_TYPE:-unknown} (error: ${IS_ERROR:-?}) · turns ${TURNS_USED:-?} · cost \$${COST:-?}" | tee -a "$LOG"
[ -n "$FINAL" ] && printf '%s\n' "$FINAL" | sed 's/^/> /' | tee -a "$LOG"

# Only content files may change: stray new files are removed, edits elsewhere abort.
ALLOWED_PATHS='^(content/[^/]+\.json|content/guides/[^/]+\.json|TRANSLATION_REVIEW\.md|\.content-review-pr\.md)$'
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
BODY="$STATE/${TODAY}-${FOCUS}-pr.md"
if [ -s .content-review-pr.md ]; then cp .content-review-pr.md "$BODY"; rm -f .content-review-pr.md
else printf '## %s content review %s\n\n(The agent wrote no summary.)\n' "$KIND" "$TODAY" > "$BODY"; fi
case "$RESULT_TYPE" in
  error_max_turns) STOP="stopped at the turn cap (${TURNS}); partial review";;
  error_max_budget*) STOP="stopped at the budget cap (\$${BUDGET}); partial review";;
  success) [ "$IS_ERROR" = true ] && STOP="ended with an error: ${FINAL:0:200}" || STOP="completed";;
  *) STOP="ended: ${RESULT_TYPE:-unknown}";;
esac
{
  echo; echo "### Run cost (reported by Claude Code)"
  echo "- ${KIND} review, focus **${FOCUS}**, model \`${MODEL}\`: ${STOP}."
  echo "- Turns used: ${TURNS_USED:-?} of ${TURNS}. Estimated cost: \$${COST:-?} (cap \$${BUDGET})."
  echo "- Run on the maintainer's machine (scripts/content-review.sh). CI runs on this pull request; no auto-merge."
} >> "$BODY"

# One line per run in the review history.
TODAY="$TODAY" KIND="$KIND" FOCUS="$FOCUS" MODEL="$MODEL" TURNS_USED="$TURNS_USED" COST="$COST" RESULT_TYPE="$RESULT_TYPE" python3 - <<'PY'
import json, os, pathlib
p = pathlib.Path("content/review-log.json")
log = json.loads(p.read_text()) if p.exists() else []
cost = os.environ.get("COST") or None
turns = os.environ.get("TURNS_USED", "")
log.append({
    "date": os.environ["TODAY"], "kind": os.environ["KIND"], "focus": os.environ["FOCUS"],
    "model": os.environ["MODEL"], "turns": int(turns) if turns.isdigit() else None,
    "costUsd": float(cost) if cost else None, "result": os.environ.get("RESULT_TYPE") or None,
    "run": "local (scripts/content-review.sh)",
})
p.write_text(json.dumps(log, indent=2) + "\n")
PY
git add -A
git reset -q -- .content-review-pr.md 2>/dev/null || true

if [ -n "${DRY_RUN:-}" ]; then
  echo "DRY_RUN: not committing. Changes:"; git diff --cached --stat; echo "PR body: $BODY"; exit 0
fi

BRANCH="content-review/${TODAY}-${FOCUS}"
git switch -q -c "$BRANCH"
git commit -q -m "${KIND} content review ${TODAY} (${FOCUS})"
git push -q origin "$BRANCH"
URL=$(cd "$REPO" && gh pr create --base redesign --head "$BRANCH" --title "${KIND} content review ${TODAY}" --body-file "$BODY")
echo "Opened ${URL}" | tee -a "$LOG"
