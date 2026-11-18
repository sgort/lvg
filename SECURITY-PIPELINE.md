# Pipeline supply-chain posture

Policy: nothing a pipeline downloads or runs may float. Use a commit hash, digest
or exact version wherever one exists. `lvg` is a sandbox, so this follows
`ttl-editor` in a lighter form. `main` is the stable release.

## Manual prerequisites

- The Renovate GitHub App must have access to `sgort/lvg`.
- Dependabot alerts must be enabled. Renovate's fast route for security fixes
  depends on them.
- `SEMGREP_APP_TOKEN` must be set as a repository secret.
- The issue labels `security` and `ci` must exist for the daily dependency audit.

## Pinned

| Dependency                     | Pin                                        | Version | Maintained by                                  |
| ------------------------------ | ------------------------------------------ | ------- | ---------------------------------------------- |
| `actions/checkout`             | `3d3c42e5aac5ba805825da76410c181273ba90b1` | v7.0.1  | Renovate                                       |
| `actions/setup-node`           | `949feb2413d6458794dcd2491c4babbbce0c15c1` | v7.1.0  | Renovate                                       |
| `zizmorcore/zizmor-action`     | `45d7276c9ca790aabd705e31ca99c6185c3e76dd` | v0.8.1  | Renovate                                       |
| `Azure/static-web-apps-deploy` | `4d27395796ac319302594769cfe812bd207490b1` | v1      | manual, because Renovate would pick a 2021 tag |
| zizmor (the audit tool)        | `version: '1.29.0'` in `zizmor.yml`        | 1.29.0  | Renovate; merge the action update first        |
| semgrep                        | `semgrep==1.176.1` in `semgrep.yml`        | 1.176.1 | manual                                         |
| renovate config validator      | `renovate@44.50.3` in `zizmor.yml`         | 44.50.3 | manual                                         |
| npm dependencies               | `package-lock.json` integrity hashes       | 3       | Renovate                                       |

`npm run check-supply-chain` compares this table with the workflows and resolves
each hash against GitHub. When Renovate updates an action, update its row on the
same branch before merging.

## Checks

| Check                  | Workflow               | Covers                                                                 |
| ---------------------- | ---------------------- | ---------------------------------------------------------------------- |
| `audit`                | `zizmor.yml`           | Workflow analysis, Renovate config, lockfile, format, signatures, pins |
| `scan`                 | `semgrep.yml`          | Semgrep Code and Supply Chain                                          |
| `Build and deploy ACC` | `azure-lvg-acc.yml`    | Lint and the production build, skipped for documentation-only changes  |
| `dependency-audit`     | `dependency-audit.yml` | Daily audit of `acc` and `main`; not a merge check                     |

Required checks match by job name, so renaming a job means updating the rulesets.

## Branch rulesets

Rulesets are GitHub state, so this section records what a diff cannot show.

| Ruleset                 | ID         | Branch | Required checks                         |
| ----------------------- | ---------- | ------ | --------------------------------------- |
| `acc supply-chain gate` | `27549985` | `acc`  | `audit`, `scan`, `Build and deploy ACC` |
| `main promotion gate`   | `27549986` | `main` | `audit`, `scan`                         |

Both require a pull request with zero approvals and merge commits only, and both
block branch deletion and force pushes. Neither has bypass actors.

If semgrep.dev is unreachable or `SEMGREP_APP_TOKEN` is revoked, `scan` fails and
merges stop until the repository owner edits the rulesets.

`require_extra_approval_for_unattributed_changes` is `true` on `acc` and `false` on
`main`, as in `ttl-editor`, `linked-data-explorer` and `ronl-business-api`. GitHub
documents it as one extra approval when Copilot opens a pull request without a human
collaborator and a non-zero approval count is required. Neither ruleset requires
approvals, so the difference is kept for consistency across the repositories. If a
Copilot pull request into `acc` is ever blocked despite passing its checks, look here
first.

A pull request that is retargeted to `acc` gets no new `Build and deploy ACC` run,
because retargeting does not trigger that workflow. If the check stays on
"Expected", run `gh pr close <number> && gh pr reopen <number>`, or push a commit.

## Dependency audit rule

The audit fails on a high or critical advisory in shipped dependencies.
Development-only findings are reported without failing it.

On 18 November 2026 the development tree carries GHSA-fc5q-39xc-vjpf in
`picomatch`, through Vite, Tailwind and `lint-staged`. No patched release exists
yet.

## Semgrep findings we accept, and why

Semgrep Supply Chain findings have no inline suppression. They are triaged in the
Semgrep UI with a comment, and the platform's API does not return that comment
(sgort/iou-architectuur#132). **This table is the record**: each row is the reason,
and the comment in the UI repeats it. A finding marked ignored in the UI without a
row here is a gap.

Last triaged on 18 November 2026, from the export of `main` at `6405f8f` and the
findings of `acc` at `1ef7b82`.

| Package (version) | Advisory                                              | Semgrep finding IDs             | Decision              | Reason                                                                                                                                                                                                                                                                                         | Revisit when                                                            |
| ----------------- | ----------------------------------------------------- | ------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `picomatch` 2.3.2 | ReDoS through repeated extglobs (GHSA-fc5q-39xc-vjpf) | acc 1088397281, main 1088402222 | accepted, 18 Nov 2026 | Development only, through Tailwind's file matching, and not in the shipped bundle. Exploiting it needs an attacker-controlled glob pattern; the patterns here come from this repository's own configuration. No patched release exists. Dependabot #3 was dismissed automatically.             | `picomatch` publishes a fix that Tailwind's dependencies can resolve to |
| `picomatch` 4.0.7 | ReDoS through repeated extglobs (GHSA-fc5q-39xc-vjpf) | acc 1088397280, main 1088402221 | accepted, 18 Nov 2026 | Development only, through Vite, `tinyglobby` and `lint-staged`, and not in the shipped bundle. Exploiting it needs an attacker-controlled glob pattern; the patterns here come from this repository's own configuration. No patched release exists. Dependabot #3 was dismissed automatically. | `picomatch` publishes a fix                                             |

Not in the table, because they are fixed rather than accepted: `glob` 10.5.0
(GHSA-3g3m-2fjr-6pw4) and `minimatch` 9.0.9 (GHSA-g3hv-75wg-m249). Updating `sucrase`
to 3.35.1 removes both from the dependency tree.

## Leftover previews

GitHub does not run `pull_request` workflows while a pull request has a merge
conflict, including its `closed` event, so a preview can outlive its pull request.
`LVG-Demo-MO-acc` is on the Free tier with three preview slots. When they are full,
`Build and deploy ACC` fails and merges into `acc` stop.

To recover:

1. Run `npm run check-previews`.
2. Review each orphan it lists.
3. Run the `az staticwebapp environment delete` command it prints.
4. Re-run the failed check on the blocked pull request.

If there are no orphans, the slots are held by open pull requests. Merge or close
one of them, then re-run the failed check.

Renovate is limited to two open pull requests to leave room in this pool.

## Deliberately left out

These parts of the `ttl-editor` pipeline are not used here: the SBOM workflow, the
quarterly dependency review, the lockfile review job, a test suite, the GitLab
mirror and the release process.
