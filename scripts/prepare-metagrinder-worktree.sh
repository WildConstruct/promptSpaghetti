#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PARENT_DIR="$(dirname "$REPO_ROOT")"
TARGET_DIR="${TARGET_DIR:-$PARENT_DIR/prompt-spaghetti-metagrinder-fork}"
TARGET_BRANCH="${TARGET_BRANCH:-exp/metagrinder-fork-staging}"

echo "Repo root: $REPO_ROOT"
echo "Parent dir: $PARENT_DIR"
echo "Target dir: $TARGET_DIR"
echo "Target branch: $TARGET_BRANCH"

if [ -e "$TARGET_DIR" ]; then
  echo "Refusing to continue: target path already exists: $TARGET_DIR" >&2
  exit 1
fi

if git -C "$REPO_ROOT" show-ref --verify --quiet "refs/heads/$TARGET_BRANCH"; then
  echo "Refusing to continue: local branch already exists: $TARGET_BRANCH" >&2
  exit 1
fi

git -C "$REPO_ROOT" worktree add "$TARGET_DIR" -b "$TARGET_BRANCH"

echo
echo "Worktree created successfully."
echo "Next recommended steps:"
echo "  1. cd \"$TARGET_DIR\""
echo "  2. review docs/research/metagrinder-fork-boundary.md"
echo "  3. review docs/research/metagrinder-subproject-manifest.json"
echo "  4. decide whether to keep the full repo in the fork or prune to the manifest path set"
