# CHANGELOG

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
