# CLAUDE.md

Guidance for Claude Code in this repository. Read it in full at the start of every session.

## What this is

LVG builds the "Wonen" content pages that Logius will publish in MijnOverheid: a homeowner
sees their properties, Kadaster, WOZ and energy label data, and gets roof insulation advice
from the Operaton decision `bereken_isolatie_opties`, followed by a consent step to share
data with a contractor. LVG is a sandbox: data, login and consent are mocked. `acc` deploys
to `acc.lvg.open-regels.nl`, `main` (the "stable release", never "production") to
`lvg.open-regels.nl`.

## Current work

Iteration 1 of the MijnOverheid Wonen redesign. Three documents govern it; read all three
before changing anything:

| Document                                                            | Role                                         |
| ------------------------------------------------------------------- | -------------------------------------------- |
| `docs/superpowers/specs/2026-11-19-mijnoverheid-wonen-ux-design.md` | What to build: pages, Dutch copy, API, rules |
| `docs/superpowers/plans/2026-11-19-mijnoverheid-wonen.md`           | How to build it: tasks, steps, commits       |
| `docs/runbook.md`                                                   | The iteration loop, local setup, review      |

Work through the plan task by task with the superpowers:subagent-driven-development or
superpowers:executing-plans skill, as the plan's header says. Find the first unchecked step,
confirm with the owner that this is where to resume, and tick steps (`- [x]`) in the plan as
they are done, in the same commit as the work.

The design source is the Figma exports in `docs/LVG - Wonen - MijnOverheid - Web - G&B/`
(desktop and mobile PDF per page; the desktop landing page is missing, see the spec). The
consent screens follow `docs/Wireframes/toestemming-wireframes.html`. The spec is leading
where it deliberately differs from the exports.

## Working with the owner

- Ask before every `git commit`: stage, report what is staged, stop. One message may approve
  several named commits. The owner merges every pull request; never push to `acc` or `main`.
- No Claude attribution in commits, pull requests or files.
- Never bypass hooks (`--no-verify`, `HUSKY=0`, `SKIP=`). A failing hook is reported, not
  worked around.
- Never start or stop the dev server and never run `npm ci`. Ask the owner to stop the server
  before dependency changes and to run `npm ci` (root and `api/`) when needed.
- No browser automation. The owner checks the UI and reports back.
- Ask clarifying questions one at a time, in chat, with your recommended answer.
- If the plan turns out to be wrong or incomplete, stop and ask. Do not improvise around it.
  Record an agreed deviation in the plan, under the task, in the same commit.
- Outside the repository, only the owner acts: Azure app settings, deploying the DMN to
  `operaton.open-regels.nl`, contacting Logius or G&B.

## Rules that the code must keep

These come from Logius's "Aansluitvoorwaarden MijnOverheid (databron)" v15, section 7.4.1,
and from the spec. Breaking one fails the iteration even when all checks pass.

- **No business logic in `src/`.** No cost figures, target values, thresholds, rounding rules,
  date comparisons, status derivations or decisions about which actions to offer. The API
  delivers outcomes, statuses and allowed actions (`acties`); pages present them.
  `src/lib/format.js` only formats with `Intl` in `nl-NL`.
- **Contract first.** A field is added to `api/openapi.yaml` before code uses it. The contract
  must pass `npm run lint:contract` (API Design Rules).
- **Errors tell the citizen what to do:** `application/problem+json` with `burgerActie`.
- **Operaton only from `api/`.** `localhost:8081`, `demo:demo` and any Operaton URL never
  appear in `dist/` (`npm run check-bundle`). Local Operaton credentials stay server side.
- **The API decides, not around the DMN.** If the DMN gives no `aanbevolen` output, no option
  is recommended; the API adds no fallback rule.
- **Privacy:** no address, BSN or other personal data in URLs, logs or browser storage.
  Woning ids are opaque.
- **Frame separation:** `src/pages/` and `src/components/` never import from `src/frame/`.
- **`api/` runs on Node 22** (SWA managed functions). The front-end toolchain uses `.nvmrc`.
- **Dependencies:** add them with `npm install`; `.npmrc` enforces a 14-day release cooldown.
  Never force a version past it. Report new transitive peers to the owner.

## Language

- Conversation, code, comments, commit messages and documentation: English, Markdown.
- Interface copy: Dutch at B1 level, exactly as in the spec. Copy marked `{…}` in the spec is a
  design placeholder and is built as written.
- API field and schema names: Dutch, as in the spec's examples.

## Accessibility

WCAG 2.2 AA. One H1 per page, focus moves to it after navigation, visible focus, no meaning
in colour alone, tables with captions. Every page test runs axe. Use Rijkshuisstijl Community
components where the spec names one; build local components on its design tokens.

## Commands

| Command                            | Purpose                                                      |
| ---------------------------------- | ------------------------------------------------------------ |
| `npm run dev`                      | Front-end and API together on localhost:5173 (owner runs it) |
| `npm test`                         | Front-end tests                                              |
| `npm run test:api`                 | API tests, responses validated against the contract          |
| `npm run lint:contract`            | ADR linter on `api/openapi.yaml`                             |
| `npm run lint`                     | ESLint                                                       |
| `npm run check-format`             | Prettier check                                               |
| `npm run build`                    | Production build                                             |
| `npm run check-bundle`             | Forbidden strings in `dist/`                                 |
| `bash scripts/deploy-dmn-local.sh` | Deploy `dmn/` to local Operaton only                         |

Commands after `npm run lint` in this table are added by the plan; until their task is done
they do not exist. Before reporting a task done, run every command that exists and show the
result.

## Repository map

| Path                   | Contents                                                          |
| ---------------------- | ----------------------------------------------------------------- |
| `src/`                 | React front-end (being replaced by the plan, Parts 2 and 3)       |
| `api/`                 | LVG API: contract, core handlers, mock sources, Operaton (Part 1) |
| `dmn/`                 | DMN source for local Operaton (Part 1, Task 5)                    |
| `vite/`                | Dev-only Vite plugin serving the API locally                      |
| `docs/superpowers/`    | Specs and plans, one pair per design decision                     |
| `docs/Wireframes/`     | Consent wireframes, published as is to toestemming.open-regels.nl |
| `.github/workflows/`   | Deploys to the acceptance and stable Static Web Apps              |
| `SECURITY-PIPELINE.md` | Supply-chain posture; update it when CI or dependencies change    |
