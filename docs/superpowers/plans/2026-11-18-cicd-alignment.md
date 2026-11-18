# LVG CI/CD Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give `sgort/lvg` the same gates and supply-chain rules as TTL, LDE and RBA, in the lighter form the design approves.

**Architecture:** Copy and adapt files from `../ttl-editor`, delivered as four pull requests into `acc`, each verified and promoted to `main` before the next. Runner builds come first, then tooling, then security checks, and rulesets last.

**Tech Stack:** GitHub Actions, Azure Static Web Apps, Node 24, npm, Vite, React 18, ESLint 9, Prettier, Husky, zizmor, Semgrep, Renovate.

**Spec:** `docs/superpowers/specs/2026-11-18-cicd-alignment-design.md`

## Global Constraints

- **Commits:** ask the owner before every `git commit`. Stage, report what is staged, stop. The owner may approve several named commits in one message. Approval never carries further than what was named.
- **Merges:** the owner merges every pull request. Never push to `acc` or `main`.
- **Attribution:** no Claude attribution in commits, pull requests, code or documentation.
- **Gates:** never use `--no-verify`, `HUSKY=0` or `SKIP=`. If a hook fails for a reason outside the task, stop and quote it.
- **Dev server:** never start, stop or restart it. The owner verifies UI in the browser. No browser automation.
- **Installs:** `npm install` and `npm ci` replace files under a running dev server, so the owner confirms the server is stopped first (Tasks 6 and 9).
- **Branches:** each part branches from an up-to-date `acc`, in the main checkout, with no worktrees.
- **Naming:** `main` is the "stable release", never "production", except Azure's own `production_branch` input.
- **Reference:** read each TTL file before adapting it. Remove comments that name TTL history not true for LVG.
- **Pins:** `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1`, `actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0`, `Azure/static-web-apps-deploy@4d27395796ac319302594769cfe812bd207490b1 # v1`, `zizmorcore/zizmor-action@53290badfa369cb0bf7ad16342cb62c2fa47ac7b # v0.8.0`, unless TTL's register has moved on. Runners use `ubuntu-24.04`.
- **Azure:** subscription `PDR - C1380`, resource group `RONL-Preproduction`, apps `LVG-Demo-MO-acc`, `LVG-Demo-MO` and `toestemming-wireframes`.

## Review Focus

1. A documentation-only pull request into `acc` must still merge, with `Build and deploy ACC` skipped rather than missing (Task 15).
2. A pull request into `acc` must deploy only to `LVG-Demo-MO-acc`, never the stable app (Task 5).
3. With `skip_app_build`, `staticwebapp.config.json` must still ship, so `/` and deep links return 200 (Tasks 2 and 5).
4. Repository-wide formatting must leave `docs/Wireframes/**` untouched, because that folder is deployed as it is (Task 8).
5. After the Vite upgrade, the dev proxy and the unauthenticated Operaton evaluate call must still work (Task 6).

---

## Publish the design

### Task 0: Put the design and plan on `acc`

**Files:** `docs/superpowers/specs/2026-11-18-cicd-alignment-design.md`, this plan.

- [ ] **Step 1:** On `docs/cicd-alignment-design`, stage this plan. After owner go-ahead, commit `docs: add CI/CD alignment plan`.
- [ ] **Step 2:** Push and open a pull request into `acc`. After the owner merges it, run `git fetch --prune origin`, fast-forward local `acc`, and delete the branch once it is an ancestor of `origin/acc`.

---

## Part 1: Runner-built deployments (branch `ci/runner-built-deploys`)

### Task 1: Node, npm and line-ending baseline

**Files:** Create `.nvmrc`, `.npmrc`, `.gitattributes`.

- [ ] **Step 1:** Create `.nvmrc` with `24.22.2`. Copy TTL's `.npmrc`, ending in `min-release-age=14`. Adapt TTL's `.gitattributes`: keep `* text=auto`, and declare `*.png`, `*.jpg` and `*.ico` binary.
- [ ] **Step 2:** Run `git add --renormalize .`, then `git ls-files --eol | grep 'i/crlf\|i/mixed'`. Expected: no output.
- [ ] **Step 3:** Run `git diff --cached --stat -w --ignore-cr-at-eol`. Expected: only the three new files have content changes. Commit `chore: pin Node and npm cooldown, normalise line endings` after go-ahead.

### Task 2: Runner-built LVG deployments

**Files:** Modify `.github/workflows/azure-lvg-acc.yml`, `.github/workflows/azure-lvg-stable.yml`. Reference: TTL's `azure-static-web-apps-orange-beach-0574c2a03.yml`.

**Interfaces:** Produces job names `Build and deploy ACC` and `Build and deploy stable`, used by Task 15. Ruleset checks match these names exactly.

- [ ] **Step 1:** Rewrite `azure-lvg-acc.yml` on TTL's shape:
  - `push` on `acc` with `paths-ignore` `docs/**`, `.claude/**`, `**/*.md`.
  - `pull_request` types `[opened, synchronize, reopened]` on `acc`, with no path filter.
  - Top-level `permissions: contents: read`.
  - `changes` job with `PATTERN: '^(docs/|\.claude/)|\.md$'`.
  - Deploy job gated with `!cancelled() && (needs.changes.result != 'success' || needs.changes.outputs.relevant == 'true')`, permissions `contents: read`, `pull-requests: write`.
  - Secret `AZURE_STATIC_WEB_APPS_API_TOKEN_LVG_ACC`, and keep `production_branch: "acc"`.
- [ ] **Step 2:** Rewrite `azure-lvg-stable.yml` the same way for `main`, without a `changes` job, with `paths-ignore` on both triggers, and secret `AZURE_STATIC_WEB_APPS_API_TOKEN_YELLOW_MEADOW_08A367D03`.
- [ ] **Step 3:** Both deploy jobs run: checkout with `persist-credentials: false`, `setup-node` with `node-version-file: .nvmrc` and `cache: npm`, `npm ci`, `npm run build`, `test -f dist/index.html`, then deploy with `action: upload`, `app_location: /dist`, `api_location: ''`, `output_location: ''`, `skip_app_build: true`. Remove the close jobs.
- [ ] **Step 4:** Run `npm run build`, then `test -f dist/staticwebapp.config.json && test -f dist/index.html && echo ok`. Expected: `ok`.
- [ ] **Step 5:** Parse all workflow YAML with Python `yaml.safe_load`. Expected: no error. Commit `ci: build LVG on the runner with pinned actions` after go-ahead.

### Task 3: Wireframes workflow and preview clean-up

**Files:** Modify `.github/workflows/azure-toestemming-wireframes.yml`. Create `.github/workflows/close-preview-environments.yml`.

- [ ] **Step 1:** In the wireframes workflow, name the job `Deploy wireframes`, pin actions, add least-privilege permissions, set `ubuntu-24.04` and `persist-credentials: false`, remove its close job, and keep the path filters and no-build deploy.
- [ ] **Step 2:** Adapt TTL's close workflow: `pull_request` types `[closed]` on `acc` and `main`, no path filter, `permissions: {}`. Jobs: `close_acc_preview` when base is `acc`; `close_stable_preview` and `close_wireframes_preview` when base is `main`. Each uses `action: close` with its app's token.
- [ ] **Step 3:** Parse the YAML, then commit `ci: close previews from a dedicated workflow` after go-ahead.

### Task 4: Leftover preview checker

**Files:** Create `scripts/check-previews.sh`. Modify `package.json` (`check-previews` script).

- [ ] **Step 1:** Adapt TTL's script, replacing workflow-filename discovery with the three explicit app names and the resource group from Global Constraints. Keep `OPEN_PRS`, exit codes and the rule that it only prints the delete command.
- [ ] **Step 2:** Run `bash -n scripts/check-previews.sh`, then `npm run check-previews`. Expected: exit 0 when no orphan exists. If `az` needs a login, stop and hand the owner the login command.
- [ ] **Step 3:** Commit `ci: add leftover preview checker` after go-ahead.

### Task 5: Ship Part 1

- [ ] **Step 1:** Push and open a pull request into `acc`. Expected: `Build and deploy ACC` succeeds with `npm ci`.
- [ ] **Step 2:** Prove detection while the preview exists: `OPEN_PRS="" npm run check-previews`. Expected: exit 1, naming this pull request's environment and printing the delete command. Delete nothing.
- [ ] **Step 3:** From the run log, confirm `Visit your site at:` shows an `ambitious-forest-034467303` host. On the preview, `/` and `/some/deep/link` return 200. Ask the owner to check the calculation there.
- [ ] **Step 4:** After the owner merges: the `acc` deploy succeeds, `acc.lvg.open-regels.nl` returns 200, its preview returns 404, and `npm run check-previews` exits 0.
- [ ] **Step 5:** Open the `acc` to `main` pull request. After the owner merges: both deployments succeed, and `lvg.open-regels.nl` and `toestemming.open-regels.nl` return 200. Do housekeeping (GitLab: none).

---

## Part 2: Foundation (branch `chore/foundation`)

### Task 6: Vite upgrade and audit fixes

**Files:** Modify `package.json`, `package-lock.json`; `vite.config.js` only if the upgrade requires it.

- [ ] **Step 1:** Ask the owner to stop the dev server. Wait for confirmation.
- [ ] **Step 2:** Upgrade `vite` to 8 and `@vitejs/plugin-react` to 5, matching TTL's ranges. Update `postcss` and other flagged tooling. Keep React 18 and Tailwind 3.
- [ ] **Step 3:** Run `npm audit --audit-level=high`. Expected: exit 0.
- [ ] **Step 4:** Run `npm run build`, then `grep -c Authorization dist/assets/*.js`. Expected: build passes, count 0.
- [ ] **Step 5:** Ask the owner to start the dev server and check the calculation. Then confirm the proxy with a POST of the existing evaluate payload to `http://localhost:5173/api/engine-rest/decision-definition/key/bereken_isolatie_opties/evaluate`, without an `Authorization` header. Expected: 200 with a result.
- [ ] **Step 6:** Commit `chore: upgrade Vite and clear audit findings` after go-ahead.

### Task 7: ESLint and Prettier configuration

**Files:** Create `eslint.config.mjs`, `.prettierrc`, `.prettierignore`. Modify `package.json`, `package-lock.json`, and `src/**` for lint fixes only.

**Interfaces:** Produces scripts `lint`, `lint:fix`, `format`, `check-format` (`eslint .`, `eslint . --fix`, `prettier --write .`, `prettier --check .`).

- [ ] **Step 1:** Add `eslint@^9`, `@eslint/js`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-config-prettier`, `globals` and `prettier`.
- [ ] **Step 2:** Create a flat config covering `src/**/*.{js,jsx}` (browser globals, JSX) and root `*.js`/`*.mjs` and `scripts/**` (Node globals), ignoring `dist/**` and `docs/**`. Copy TTL's `.prettierrc`. `.prettierignore` lists `node_modules`, `dist`, `docs/Wireframes`, `package-lock.json` and `*.html`.
- [ ] **Step 3:** Run `npm run lint`. Fix findings that cannot change behaviour. Report the rest to the owner before continuing. Expected finally: exit 0.
- [ ] **Step 4:** Commit `chore: add ESLint and Prettier` after go-ahead.

### Task 8: Repository-wide format

- [ ] **Step 1:** Run `npm run format`, then `npm run check-format`. Expected: passes.
- [ ] **Step 2:** Run `git status --short docs/Wireframes`. Expected: no output.
- [ ] **Step 3:** Run `npm run lint && npm run build`. Expected: both pass. Commit only this formatting as `style: apply Prettier` after go-ahead.

### Task 9: Local safety net

**Files:** Create `.husky/pre-commit`, `.husky/pre-push`, `scripts/check-deps.sh`, `scripts/write-deps-marker.mjs`. Modify `package.json`, `package-lock.json`.

- [ ] **Step 1:** With the owner's dev server stopped, add `husky` and `lint-staged`. Copy both scripts from TTL, adapting anything specific to it.
- [ ] **Step 2:** Add scripts: `dev` as `npm run deps:check && vite`, `deps:check`, `prepare` as `husky`, `postinstall` as `node scripts/write-deps-marker.mjs`. Add `lint-staged` with TTL's config, extended to `scripts/**`.
- [ ] **Step 3:** `pre-commit` runs `npx lint-staged`. `pre-push` runs `npm run deps:check`, `npm run lint` and `npm run check-format`.
- [ ] **Step 4:** Run `npm ci`, then `npm run deps:check`. Expected: exit 0. Ask the owner to restart the dev server.
- [ ] **Step 5:** Commit `chore: add Husky hooks and dependency check` after go-ahead. Expected: the hook runs.

### Task 10: Lint in CI and ship Part 2

- [ ] **Step 1:** Add `npm run lint` before the build in both LVG deploy workflows. Commit `ci: lint before building` after go-ahead.
- [ ] **Step 2:** Push (`pre-push` must pass) and open a pull request into `acc`. Expected: `Build and deploy ACC` passes, proving the new lockfile on Linux. Ask the owner to check the preview.
- [ ] **Step 3:** After merge, verify `acc`. Promote, verify both stable sites, ask the owner to check the calculation, and do housekeeping.

---

## Part 3: Security checks (branch `ci/security-checks`)

### Task 11: Prerequisites

- [ ] **Step 1:** Ask the owner to add `SEMGREP_APP_TOKEN` and confirm Renovate has access. With go-ahead, enable Dependabot alerts: `gh api -X PUT repos/sgort/lvg/vulnerability-alerts`.
- [ ] **Step 2:** Create the labels: `gh label create security -R sgort/lvg` and `gh label create ci -R sgort/lvg`. Confirm with `gh secret list` and `gh label list`.

### Task 12: Workflow audit, Renovate and pin register

**Files:** Create `.github/workflows/zizmor.yml`, `.github/zizmor.yml`, `renovate.json`, `SECURITY-PIPELINE.md`, `scripts/check-supply-chain.mjs`, `scripts/audit-signatures.sh`. Modify `package.json`.

**Interfaces:** Produces required check `audit`; scripts `check-supply-chain` and `audit:signatures`.

- [ ] **Step 1:** Copy TTL's `zizmor.yml` without `lockfile-review` and `lockfile-review-comment`. Keep job name `audit`, unfiltered `pull_request`, and all steps. Copy `.github/zizmor.yml` and both scripts.
- [ ] **Step 2:** Copy `renovate.json`. Set `prConcurrentLimit` to 2, and remove the lock-file maintenance rule's `prConcurrentLimit: 0` and `prHourlyLimit: 0`. Keep the Azure action, Tailwind major and ESLint major rules.
- [ ] **Step 3:** Write a short `SECURITY-PIPELINE.md`: policy, manual prerequisites, the **Pinned** table in TTL's format, the workflow count for 7 workflows if the checker requires it, required checks, the no-bypass warning, leftover-preview recovery, and the omissions from the spec's Non-goals.
- [ ] **Step 4:** Run `npm run check-supply-chain`, `npm run audit:signatures` and `npx --yes --package renovate@44.50.3 renovate-config-validator --strict`, using TTL's validator version if newer. Expected: all pass. If the seven-workflow count is not yet true, finish Tasks 13 and 14 first.
- [ ] **Step 5:** Commit `ci: add workflow audit, Renovate and pin register` after go-ahead.

### Task 13: Semgrep

**Files:** Create `.github/workflows/semgrep.yml`, `.semgrepignore`.

- [ ] **Step 1:** Copy TTL's workflow, keeping job name `scan`, unfiltered `pull_request`, `fetch-depth: 0`, the pinned `semgrep` version, and `semgrep ci --no-suppress-errors`. `.semgrepignore` excludes `docs/`.
- [ ] **Step 2:** Commit `ci: add Semgrep scan` after go-ahead.

### Task 14: Daily dependency audit

**Files:** Create `.github/workflows/dependency-audit.yml`, `scripts/audit-tree.mjs`.

- [ ] **Step 1:** Copy both from TTL, keeping job name `dependency-audit` and its audit of `acc` and `main`.
- [ ] **Step 2:** Run `node scripts/audit-tree.mjs "local"`. Expected: exit 0.
- [ ] **Step 3:** Run `npm run check-supply-chain`. Expected: passes. Commit `ci: add daily dependency audit` after go-ahead.

### Task 14a: Ship Part 3

- [ ] **Step 1:** Open a pull request into `acc`. Expected: `audit`, `scan`, `dependency-audit` and `Build and deploy ACC` pass. Stop and report any Semgrep finding that blocks.
- [ ] **Step 2:** After merge, run `gh workflow run dependency-audit.yml --ref acc`. Expected: success. Confirm Renovate's onboarding pull request or dashboard appears.
- [ ] **Step 3:** Promote, verify, and do housekeeping.

---

## Part 4: Gates (branch `ci/rulesets`)

### Task 15: Apply and prove the rulesets

**Files:** Modify `SECURITY-PIPELINE.md`.

- [ ] **Step 1:** Confirm `audit`, `scan` and `Build and deploy ACC` passed on `acc`, and `audit` and `scan` on `main`.
- [ ] **Step 2:** Export TTL's rulesets `21728745` and `24227117` to the scratchpad and build LVG's request bodies, keeping `integration_id` values. Remove `lockfile-review`, and use `Build and deploy ACC` as the third `acc` check. Show the owner both bodies and get go-ahead.
- [ ] **Step 3:** Create them with `gh api -X POST repos/sgort/lvg/rulesets --input <file>`. Set repository options: `allow_merge_commit=true`, `allow_squash_merge=false`, `allow_rebase_merge=false`, `delete_branch_on_merge=true`.
- [ ] **Step 4:** Run `gh api repos/sgort/lvg/rules/branches/acc` and `.../main`. Expected: pull request, required checks, deletion and non-fast-forward rules, with no bypass actors. Do not attempt a test push.
- [ ] **Step 5:** Record both ruleset IDs in `SECURITY-PIPELINE.md`. Commit `docs: record the branch rulesets` after go-ahead.
- [ ] **Step 6:** Open the pull request into `acc`. It changes only Markdown, so expected: `Build and deploy ACC` is **skipped**, `audit` and `scan` pass, and GitHub reports it mergeable.
- [ ] **Step 7:** After merge, promote through `main promotion gate`. Verify all three sites and run `npm run check-previews`. Do final housekeeping.
- [ ] **Step 8:** Ask the owner whether to add `lvg` to the pull-request-only list in their global `CLAUDE.md`.
