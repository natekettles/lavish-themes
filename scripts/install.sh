#!/usr/bin/env bash
# install.sh — set up lavish-themes for local + Claude Code use.
#
# - Clones (or updates) this repo at $LAVISH_THEMES_DIR (default ~/.lavish-themes).
# - Optionally symlinks ~/.claude/skills/lavish-themes -> the cloned repo so
#   Claude Code agents can discover the themes via SkillRef.
# - Prints the gallery file path so you can preview the six themes in a browser.
#
# Idempotent. Safe to re-run.

set -euo pipefail

REPO_URL="${LAVISH_THEMES_REPO_URL:-https://github.com/natekettles/lavish-themes.git}"
TARGET_DIR="${LAVISH_THEMES_DIR:-$HOME/.lavish-themes}"
SKILLS_DIR="$HOME/.claude/skills"
SKILL_LINK="$SKILLS_DIR/lavish-themes"

bold() { printf "\033[1m%s\033[0m\n" "$*"; }
dim()  { printf "\033[2m%s\033[0m\n" "$*"; }
warn() { printf "\033[33m%s\033[0m\n" "$*"; }
ok()   { printf "\033[32m✓\033[0m %s\n" "$*"; }

bold "lavish-themes installer"
echo

# ---- step 1: clone or update ------------------------------------------------
if [[ -d "$TARGET_DIR/.git" ]]; then
  dim "Repo already exists at $TARGET_DIR — pulling latest…"
  git -C "$TARGET_DIR" pull --ff-only --quiet
  ok "Updated $TARGET_DIR"
elif [[ -e "$TARGET_DIR" ]]; then
  warn "$TARGET_DIR exists but is not a git repo. Aborting to avoid clobbering."
  exit 1
else
  dim "Cloning $REPO_URL → $TARGET_DIR…"
  git clone --depth 1 --quiet "$REPO_URL" "$TARGET_DIR"
  ok "Cloned to $TARGET_DIR"
fi

# ---- step 2: optionally symlink into ~/.claude/skills/ ----------------------
echo
if [[ -d "$SKILLS_DIR" ]]; then
  if [[ -L "$SKILL_LINK" ]]; then
    current="$(readlink "$SKILL_LINK")"
    if [[ "$current" == "$TARGET_DIR" ]]; then
      ok "Skill symlink already in place: $SKILL_LINK → $TARGET_DIR"
    else
      warn "Skill symlink points elsewhere ($current). Re-pointing…"
      ln -sfn "$TARGET_DIR" "$SKILL_LINK"
      ok "Symlink updated: $SKILL_LINK → $TARGET_DIR"
    fi
  elif [[ -e "$SKILL_LINK" ]]; then
    warn "$SKILL_LINK exists and is not a symlink. Skipping skill registration."
    warn "Move or remove it manually if you want lavish-themes available to Claude Code."
  else
    read -r -p "Symlink lavish-themes into Claude Code skills at $SKILL_LINK? [Y/n] " reply
    reply="${reply:-Y}"
    if [[ "$reply" =~ ^[Yy] ]]; then
      ln -s "$TARGET_DIR" "$SKILL_LINK"
      ok "Linked: $SKILL_LINK → $TARGET_DIR"
    else
      dim "Skipped skill symlink."
    fi
  fi
else
  dim "~/.claude/skills not found — skipping skill registration."
  dim "(Install Claude Code first if you want agents to discover these themes.)"
fi

# ---- step 3: preview hint ---------------------------------------------------
echo
bold "Preview the themes"
echo "  open $TARGET_DIR/_gallery.html"
echo
dim "Or pick a theme directly:"
for f in "$TARGET_DIR"/tier1/*.html "$TARGET_DIR"/tier2/*.html; do
  [[ -e "$f" ]] && echo "  $f"
done

# ---- step 4: what's next ----------------------------------------------------
echo
bold "Related projects"
echo "  lavish-axi         https://github.com/kunchenguid/lavish-axi"
echo "  lavish-publish-cf  https://github.com/natekettles/lavish-publish-cf"
echo
ok "Done."
