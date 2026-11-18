# LVG CI/CD alignment design

Date: 18 November 2026
Status: approved 18 November 2026

## Intent

Bring `sgort/lvg` in line with the CI/CD approach of `ttl-editor` (TTL),
`linked-data-explorer` (LDE) and `ronl-business-api` (RBA), so the same working
habits, gates and supply-chain rules apply in all four repositories.

LVG is a sandbox. `acc` serves `acc.lvg.open-regels.nl`. `main` is the stable
release at `lvg.open-regels.nl`, and is never called production. The alignment
is therefore "same gates, lighter": keep what protects the flow, leave out what
only pays off for a production system.

TTL is the reference, because it is also a single-package Vite app with one
Static Web App per branch. LDE and RBA are monorepos, and their per-workspace
patterns do not apply.

## Goals

- `acc` and `main` change only through pull requests, enforced by GitHub rulesets.
- The bundle that ships is built on the runner from `npm ci`, so the lockfile
  decides what is deployed.
- Everything a pipeline downloads or runs is pinned, and the pins are checked.
- Workflow audit, Semgrep, a daily dependency audit and Renovate run as in TTL.
- Local work has the same safety net: Node pin, npm cooldown, Husky, lint and
  formatting.

## Non-goals

- SBOM workflow and `sbom` scripts.
- Quarterly dependency review.
- Lockfile review job (`lockfile-review`, `lockfile-review-comment`).
- A test suite, and any test gate.
- GitLab mirror and `check-mirror`.
- The release process (`/bump-release`, CalVer).
- Application features or behaviour changes.

## Anti-goals

This work has failed, even if every check is green, if:

- the stable release or the wireframes site stops working;
- a push or pull request into `acc` can deploy to `lvg.open-regels.nl`;
- a pull request can get stuck on a required check that never reports;
- the calculation in **Dakisolatie verbeteren** stops working.

## Constraints

- All work reaches `acc` through a pull request, then `main` through a pull
  request from `acc`. Every commit needs the owner's go-ahead.
- No Claude attribution in commits, pull requests, code or documentation.
- Never bypass Husky or any other verification gate.
- No dev-server management. The owner verifies UI in the browser.
- `acc` deploys to the Static Web App `LVG-Demo-MO-acc` on the **Free** tier,
  which has three staging environments. `main` deploys to `LVG-Demo-MO`
  (Standard). The wireframes deploy to `toestemming-wireframes` (Free).
- Git stores LF, while the Windows working copy has CRLF under
  `core.autocrlf=true`. The exception is `azure-lvg-stable.yml`, which has CRLF
  in the index until this work normalises it.

## Approaches

| Approach | Trade-off | Outcome |
| --- | --- | --- |
| Copy and adapt TTL's files, in four pull requests | Duplicates files, as the other repositories already do. Reviewable, and each step is verified on `acc` | **Chosen by the owner** |
| The same files in one pull request | Less promotion overhead, but hard to review, and one failure blocks everything | Rejected |
| Shared reusable workflows | Less duplication, but LVG would become the only repository working this way | Rejected |

Scope was also chosen by the owner: "same gates, lighter", rather than full TTL
parity or gates and deploys only.

## Design

Each numbered part is one pull request into `acc`. After it is merged and
verified on `acc.lvg.open-regels.nl`, one promotion pull request takes it to
`main` before the next part starts.

### Part 1: Runner-built deployments

This part comes first so the Vite upgrade never passes through Azure's own build.
That build (Oryx) currently chooses Node 22 and runs `npm install`, so it ignores
both `.nvmrc` and the lockfile's exact install. This part keeps the current
dependencies, which isolates the build change from the upgrade.

- `.nvmrc` with `24.22.2`, matching TTL.
- `.npmrc` with `min-release-age=14`, with TTL's explanatory comment.
- `.gitattributes` adapted from TTL, normalising line endings.

Rewrite the deploy workflows on TTL's shape. All actions are pinned to the digests
in TTL's register, with `ubuntu-24.04`, least-privilege `permissions` and
`persist-credentials: false`.

| Workflow | Job name (exact) | Trigger | Target |
| --- | --- | --- | --- |
| `azure-lvg-acc.yml` | `Build and deploy ACC` | push and pull request on `acc` | `LVG-Demo-MO-acc` |
| `azure-lvg-stable.yml` | `Build and deploy stable` | push and pull request on `main` | `LVG-Demo-MO` |
| `azure-toestemming-wireframes.yml` | `Deploy wireframes` | push and pull request on `main`, wireframes paths only | `toestemming-wireframes` |

- **Build steps for both LVG workflows:** checkout, `setup-node` from `.nvmrc`,
  `npm ci`, `npm run build`, fail if `dist/index.html` is missing,
  then deploy with `app_location: /dist`, `output_location: ''` and
  `skip_app_build: true`. Part 2 adds the lint step. There is no test step.
- **`production_branch: "acc"` stays** in `azure-lvg-acc.yml`, because that app is
  not linked to a repository branch.
- **`changes` job in `azure-lvg-acc.yml`:** as in TTL, so documentation-only pull
  requests skip the build yet still report the required check. Ignored paths are
  `docs/**`, `.claude/**` and `**/*.md`, on `push` as well, with the `PATTERN`
  regular expression kept in step. The job runs when `changes` fails.
- **`azure-lvg-stable.yml`** uses the same `paths-ignore` on its triggers. It is
  not a required check, so it does not need a `changes` job.
- **Wireframes** keep their no-build deploy and path filter.
- **`close-preview-environments.yml`** replaces the close jobs in all three
  workflows. It has no path filter and one job per app: acc-based pull requests
  close on `LVG-Demo-MO-acc`; main-based ones close on `LVG-Demo-MO` and on
  `toestemming-wireframes`. Closing a non-existent environment is harmless.

**Leftover previews**

GitHub does not run `pull_request` workflows while a pull request has a merge
conflict, and that includes `closed`, so a preview can outlive its pull request.
`LVG-Demo-MO-acc` has only three slots, and a full pool fails the required
`Build and deploy ACC` check. The owner chose to stay on the Free tier with a
checker:

- Adapt TTL's `scripts/check-previews.sh` and add `npm run check-previews`. TTL's
  version finds apps from `azure-static-web-apps-<hostname>.yml` file names, which
  LVG no longer uses, so LVG's version names its three apps explicitly.
- The script stays read-only: it reports each orphan and prints the delete command.
  Deleting remains a human decision.
- It is run during housekeeping, and `SECURITY-PIPELINE.md` documents the recovery
  steps for a blocked `acc`.

### Part 2: Foundation

**Dependencies**

- Clear the `npm audit` findings: 14 today (10 high), all in development
  tooling, none in runtime dependencies.
- Move to TTL's majors: `vite` 8 and `@vitejs/plugin-react` 5. Keep React 18 and
  Tailwind 3. `lucide-react` stays unless the audit requires a change.
- Keep the `/api` dev proxy in `vite.config.js` working.
- Generate the lockfile so `npm ci` succeeds on Linux as well as Windows. Native
  optional packages are the known risk, and this pull request's runner build is
  the proof.

**Lint and format**

- ESLint 9 flat config: `@eslint/js` recommended, `eslint-plugin-react`,
  `eslint-plugin-react-hooks` and `eslint-config-prettier`, covering `src/**` and
  root config files. TTL's import-sort, jsx-a11y and testing plugins are left out.
- Prettier with TTL's `.prettierrc` and an adapted `.prettierignore`, which must
  exclude `docs/Wireframes/**`, `dist` and `node_modules`.
- Repository-wide reformatting is a **separate commit** with no other changes.
- Lint findings are fixed only where that cannot change behaviour. Anything else
  is reported to the owner rather than silently changed.

**Pipeline**

- Add an `npm run lint` step before the build in both LVG deploy workflows.

**Local safety net**

- Husky: `pre-commit` runs `npx lint-staged`; `pre-push` runs `npm run deps:check`,
  `npm run lint` and `npm run check-format`.
- `lint-staged` as in TTL.
- `scripts/check-deps.sh` and `scripts/write-deps-marker.mjs` from TTL.
- `package.json` scripts: `dev` becomes `npm run deps:check && vite`. Add `lint`,
  `lint:fix`, `format`, `check-format`, `deps:check`, `prepare` and `postinstall`.

### Part 3: Security checks

Copied from TTL unless stated, keeping the exact job names.

- **`.github/workflows/zizmor.yml`, job `audit`:** zizmor, `renovate.json`
  validation, lockfile consistency, `check-format`, `audit:signatures` and
  `check-supply-chain`. Leave out `lockfile-review` and `lockfile-review-comment`.
- **`.github/zizmor.yml`** as in TTL.
- **`.github/workflows/semgrep.yml`, job `scan`** and `.semgrepignore`, adapted to
  exclude `docs/`.
- **`.github/workflows/dependency-audit.yml`, job `dependency-audit`**, with
  `scripts/audit-tree.mjs`. The labels `security` and `ci` must be created first,
  because the workflow's `gh issue create` fails without them.
- **`renovate.json`** as in TTL, with these changes:
  - `prConcurrentLimit` is **2**, and the lock-file maintenance rule does not lift
    the limit. Each pull request into `acc` takes a staging slot, and the Free tier
    has three. A full pool would fail the required `Build and deploy ACC` check.
  - Tailwind majors stay disabled, as do ESLint majors and Renovate updates for
    `Azure/static-web-apps-deploy`.
- **`scripts/check-supply-chain.mjs`** and **`scripts/audit-signatures.sh`**, with
  their npm scripts.
- **`SECURITY-PIPELINE.md`:** a short LVG version containing the policy, the manual
  prerequisites, the **Pinned** table in the format `check-supply-chain` parses, the
  rulesets, the leftover-preview recovery steps, and the deliberate omissions listed
  under Non-goals.

### Part 4: Gates

Applied only after Parts 1 to 3 are on both `acc` and `main`, and after `audit`,
`scan` and `Build and deploy ACC` have each passed there.

| Ruleset | Target | Rules |
| --- | --- | --- |
| `acc supply-chain gate` | `refs/heads/acc` | Pull request required, merge commit only, 0 approvals; required checks `audit`, `scan`, `Build and deploy ACC`; no deletion; no non-fast-forward; no bypass actors |
| `main promotion gate` | `refs/heads/main` | The same, with required checks `audit` and `scan` |

Repository settings, as in TTL: merge commits only, and delete branch on merge.

The pull request records the final ruleset IDs in `SECURITY-PIPELINE.md`. As in
TTL, no bypass actors means an outage of semgrep.dev or a revoked token stops
merges until the owner edits the ruleset.

## Manual prerequisites for the owner

Needed before Part 3 can pass:

1. Add `SEMGREP_APP_TOKEN` as a repository secret on `sgort/lvg`.
2. Confirm the Renovate GitHub App has access to `sgort/lvg`.
3. Enable Dependabot alerts on `sgort/lvg`. Claude can do this with the owner's
   go-ahead.

## Verification

| Part | Evidence |
| --- | --- |
| 1 | Preview and `acc` builds pass on the runner with `npm ci`; `acc.lvg.open-regels.nl` and, after promotion, `lvg.open-regels.nl` and `toestemming.open-regels.nl` respond; a closed pull request leaves no preview; `npm run check-previews` exits 0; owner confirms the calculation |
| 2 | `npm ci`, `npm run lint`, `npm run check-format` and `npm run build` pass locally and on the runner; `npm audit` reports no high or critical findings; owner confirms the calculation on `localhost:5173`, then on `acc` and after promotion on the stable release |
| 3 | `audit`, `scan` and a manually triggered `dependency-audit` pass; Renovate's onboarding or dashboard appears |
| 4 | `gh api` shows both rulesets active; `gh api repos/sgort/lvg/rules/branches/acc` and `.../main` return the expected effective rules, with no test push attempted; a documentation-only pull request can still merge with `Build and deploy ACC` skipped |

## Left to the builder

- The exact order of commits within each part.
- Trimming TTL's long explanatory comments to what is still true for LVG, without
  naming TTL issues that do not apply.
- Which current pinned versions to use, provided the register and workflows agree.
- Any small script adaptation needed for LVG's layout.
