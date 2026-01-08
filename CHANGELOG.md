# CHANGELOG

## 2026-01-07 — feat-nav-by-arr-key

### Add arrow-key navigation for folder pane

Implements keyboard navigation in the folder pane only: up/down moves between visible folders, left closes or moves to parent, and right opens or moves to the first child. The active folder row now also shows the hover background, with focus preserved during navigation.

Changelog:
- Add folder-pane keydown handling and visible-folder traversal
- Highlight the active folder row with the hover background
- Keep keyboard focus on the folder pane during navigation

Tests:
- Manual: `./fkupd.sh drft/feat-nav-by-arr-key` (user-verified)

## 2026-01-07 — docs-agents-intg-direct

### Allow direct AGENTS updates in intg

Clarifies that AGENTS.md changes are made directly in `intg` without creating branches, while keeping the default workflow for other changes.

Changelog:
- Allow direct AGENTS.md updates in `intg`

Tests:
- Not run (documentation-only change)

## 2026-01-07 — docs-intg-push-policy

### Clarify intg push policy

Documents that `intg` is the integration branch and must not be pushed to `upstream/main`. Clarifies that PRs are created only from `./preq/*` worktrees.

Changelog:
- Clarify push policy for `intg` and PR source worktrees

Tests:
- Not run (documentation-only change)

## 2026-01-07 — feat-add-agents-md

### Add AGENTS instructions

Adds AGENTS.md to version control so the project rules are distributed with the repo. This ensures consistent guidance across worktrees.

Changelog:
- Add AGENTS.md to the repository root

Tests:
- Not run (documentation-only change)
