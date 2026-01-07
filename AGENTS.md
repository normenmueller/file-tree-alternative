# File-Tree-Alternative – Codex Operating Rules

## Language

- **Chat**: German.
- **Code & docs**: English only.

## Workspace Layout

- `./main` → Upstream baseline mirror (**read-only**).
- `./intg` → Integration worktree (branch `intg`).
- `./drft/{feat, fix, ...}-<feature>` → Draft worktrees (not published).
- `./preq/{feat, fix, ...}-<feature>` → PR worktrees (published PRs).

## Engineering Expectations

- Act as an expert Obsidian/TypeScript/HTML/CSS engineer and a seasoned software architect.
- Prefer minimal, targeted changes; avoid refactors unless requested.
- Deliver professional-grade code that is robust, maintainable, clear, correct, and performant; include tests whenever feasible.
- Optimize for robustness, clarity, maintainability, and compatibility with `./main`.
- Ask clarifying questions before risky changes.

## Commit Rules (Strict)

- Use Conventional Commits with **lowercase** prefix (`fix:`, `feat:`, `docs:`, `chore:`, …).
- Always **propose a commit message first** and wait for explicit approval.
- Do **not** rewrite history of branches with open PRs unless explicitly instructed.

## Workflow (Strict)

### 1) Where to Work

- Default: work **only** in `./drft/...`.
- Exception: fixing an **already published PR** → work directly in the matching `./preq/...`.
- Exception: changes to `AGENTS.md` are made directly in `./intg`; no branch is required.
- Never develop in `./intg` or `./main` (except for direct `AGENTS.md` updates).

### 2) Checkpoint Tags (Mandatory)

- Before any risky change, create a checkpoint tag.
- Pattern: `checkpoint-review-<branch>-<finding>-YYYY-MM-DD`.
- Remove the tag **only after approval**.

### 3) Feature Branch Creation

- Feature branches are **always** based on `upstream/main` (never `intg`).

```
git -C ./intg fetch upstream
git -C ./intg branch {feat, fix, ...}-<feature> upstream/main
git -C ./intg worktree add ./drft/{feat, fix, ...}-<feature> {feat, fix, ...}-<feature>
```

### 4) Publishing a PR

- When ready: move `./drft/...` → `./preq/...`:

```
git -C ./intg worktree move ./drft/{feat, fix, ...}-<feature> ./preq/{feat, fix, ...}-<feature>
```

- Open PR from that feature branch to upstream.

### 5) PR Documentation (Mandatory)

- Each feature branch **must** contain `PR.md` at repo root.
- Structure (exact):

```
# <branch-name>

<branch-url>

## <Short title>

<1–3 sentence summary>

Examples (illustrative):

- Example 1
- Example 2

## Changelog

- Bullet list of changes

## Tests

- List of tests run (or "Not run")
```

### 6) Integration to `intg`

- Only when explicitly requested.
- Always **merge** (no cherry-picks) and **always** with `--no-ff`.
- Merge commit message format:
  `Merge branch '<feature-branch>' of github.com:normenmueller/file-tree-alternative into intg`

```
git -C ./intg fetch origin <feature-branch>
git -C ./intg merge --no-ff origin/<feature-branch>
```

### 7) Changelog & Roadmap

- `./intg/CHANGELOG.md` is the **single source of truth** for:
  - Integration summaries
  - Roadmap/Findings tracking
- After merging a feature into `intg`:
  - Copy summary from `PR.md` into `CHANGELOG.md`
  - Remove `PR.md` from `intg` (avoid conflicts)
  - Order entries **newest first**
  - Commit with `chore: update integration changelog (<feature>)`

### 8) Push Policy

- **Never push** any branch until explicitly approved.
- **Never push** from `intg` to `upstream/main`; `intg` is the integration branch.
- PRs are opened **only** from `./preq/*` worktrees.
- Before any push, ensure the branch **compiles** and the **relevant tests pass** (only the tests affected by the change set).
- For open PR branches, no history rewrites unless explicitly requested.

### 9) Testing (Required when tests are added)

- If a change adds or modifies tests, **run the relevant tests**.
- **User runs `npm install`**. Do not run it unless explicitly requested.
- **Fresh branch/worktree rule**: before running any tests in a newly created worktree, verify `node_modules/` exists. If it does not, ask the user to run `npm install` and wait for confirmation before executing tests.
- For UI‑only changes where automated tests are not applicable:
  - Perform manual verification.
  - Record “Not run (manual testing only)” in `PR.md`.
- Prefer **narrow test scope** (single test file) to avoid unrelated upstream noise.
- Ignore unrelated test noise/failures that are not caused by the current change set.

### 10) Integration Test Pass (after merge into `intg`)

- After merging a feature/fix into `intg`, run the **same tests** that were run in the merged branch.
- Aggregate the test list from all newly merged branches in that merge session (`./preq/*` and Drafts → Integrated).
- Use the same scope/constraints as the branch (e.g., narrow test files only).
- If a branch had “Not run (manual testing only)”, repeat the manual checks in `intg` and note that in `CHANGELOG.md` if needed.
- Do **not** introduce new tests solely for `intg` unless explicitly requested.

### 11) Status-Check (sync/clean)

If the user asks to check the project status (sync/clean), propose the following full health check and run it only after approval:

1) **List all worktrees**
```
git -C ./intg worktree list
```

2) **Check clean/dirty state per worktree**
Run `git status -sb` for:
- `./intg`
- `./main`
- every `./preq/*` worktree
- every `./drft/*` worktree

3) **Sync checks**
- `./main` must be **in sync** with `origin/main`.
- `./intg` must be **not behind** `upstream/main`:
```
git -C ./intg rev-list --left-right --count upstream/main...HEAD
```
- `./preq/*` should be in sync with their `origin/<branch>` unless explicitly stated otherwise.
- `./drft/*` should be clean and may be ahead of `upstream/main` (report ahead count).
- Verify **no stray checkpoint tags** remain:
  - List `checkpoint-*` tags.
  - Only keep tags that are explicitly still needed; otherwise report them as cleanup items.

4) **Report**
Return a concise summary:
- clean/dirty per worktree
- ahead/behind vs remote
- any outliers that need action
- leftover checkpoint tags (if any)

## Quality Attributes

- Robustness
- Modularity
- Maintainability
- Naming consistency
- Standards compliance
- Scalability
- Performance / responsiveness
- Resource efficiency
