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
| `zizmorcore/zizmor-action`     | `53290badfa369cb0bf7ad16342cb62c2fa47ac7b` | v0.8.0  | Renovate                                       |
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

## Dependency audit rule

The audit fails on a high or critical advisory in shipped dependencies.
Development-only findings are reported without failing it.

On 18 November 2026 the development tree carries GHSA-fc5q-39xc-vjpf in
`picomatch`, through Vite and Tailwind. No patched release exists yet.

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

Renovate is limited to two open pull requests to leave room in this pool.

## Deliberately left out

These parts of the `ttl-editor` pipeline are not used here: the SBOM workflow, the
quarterly dependency review, the lockfile review job, a test suite, the GitLab
mirror and the release process.
