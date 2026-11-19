# Runbook: MijnOverheid Wonen

How design and build move in iterations until the Wonen pages are stable enough for the
functional design and the Logius connection. Each iteration follows the same loop and ends
with an entry in the log at the bottom.

## Roles

| Role      | Who                    | Does                                                         |
| --------- | ---------------------- | ------------------------------------------------------------ |
| Owner     | Steven Gort (ICTU)     | Decides scope, approves commits, merges, checks the UI       |
| Design    | G&B (Figma owner: Jan) | Delivers and changes the designs and their copy              |
| Planner   | Claude (chat)          | Compares designs, asks questions, updates spec and plan      |
| Builder   | Claude Code session    | Implements the plan under `CLAUDE.md`; never commits unasked |
| Publisher | Logius (MijnOverheid)  | Sets the connection conditions; receives the result          |

## The iteration loop

1. **Collect the design input.** Export the changed Figma frames, desktop and mobile, as PDF
   into `docs/LVG - Wonen - MijnOverheid - Web - G&B/`, replacing the old files under the same
   names. Add new frames under a name that says page and width, for example
   `koopwoning detail dakisolatie - desktop.pdf`. Note feedback that is not in Figma (review
   remarks, Logius answers) in the log entry for the new iteration.
2. **Compare.** The builder lists every difference between the exports and the current
   spec: copy, fields, order, layout, new pages. Differences become questions to the owner,
   one at a time, in chat.
3. **Update the spec.** Edit `docs/superpowers/specs/2026-11-19-mijnoverheid-wonen-ux-design.md`
   in place: change the page sections, move answered items out of "Open questions", and raise
   the iteration number in the status line. A new spec file is only made for a change of
   direction (for example after Logius's code conditions arrive).
4. **Plan.** Write a new plan, `docs/superpowers/plans/<date>-mijnoverheid-wonen-iteration-<n>.md`,
   with only the tasks for this iteration, in the format of the first plan. Contract changes
   come first, then API, then pages.
5. **Build.** Start a Claude Code session in the repository. It reads `CLAUDE.md`, which
   points it to the current plan. Branch from `acc`, one pull request per part.
6. **Review on the preview.** Each pull request gets a preview site. Walk through the review
   checklist below.
7. **Merge and log.** After merge to `acc`, add the log entry. Promote to `main` when a
   version is worth showing outside the team.

## Local setup

Prerequisites: Node.js as in `.nvmrc` with npm 11.10 or newer; a local Operaton on
`http://localhost:8081` with `bereken_isolatie_opties` deployed.

```bash
npm ci
npm ci --prefix api
npm run dev
```

Deploy the decision to local Operaton once, and again after every change in `dmn/`:

```bash
bash scripts/deploy-dmn-local.sh
```

The app runs on http://localhost:5173 and opens at `/nl/wonen`. The dev server also serves
the LVG API on `/api/v1/...` through `vite/lvgApiPlugin.js`; no Azure tooling is needed.

Settings for local development go in `.env.local` (never committed):

| Variable            | Default                             | Purpose                                 |
| ------------------- | ----------------------------------- | --------------------------------------- |
| `OPERATON_BASE_URL` | `http://localhost:8081/engine-rest` | Operaton used by the API                |
| `OPERATON_USER`     | `demo`                              | Local Operaton login, server side only  |
| `OPERATON_PASSWORD` | `demo`                              | Local Operaton login, server side only  |
| `LVG_SCENARIOS`     | `on`                                | Lets the scenario switch reach the API  |
| `VITE_FRAME`        | (on)                                | `off` builds without the stand-in frame |

To use the public Operaton instead of a local one, set
`OPERATON_BASE_URL=https://operaton.open-regels.nl/engine-rest` and leave the login empty.

### Checking against the real Azure Functions runtime (optional)

The Vite plugin runs the same core handlers as Azure, but not the Azure runtime itself. To
check the adapter, use the Static Web Apps CLI with Azure Functions Core Tools installed:

```bash
npm run build
npx @azure/static-web-apps-cli start dist --api-location api
```

The site then runs on http://localhost:4280.

## Scenarios

The band of the stand-in frame has a scenario switch. It sends `X-LVG-Scenario` to the API,
which honours it only when `LVG_SCENARIOS=on`.

| Scenario        | What you see                                                               | Use it to check                         |
| --------------- | -------------------------------------------------------------------------- | --------------------------------------- |
| `drie-woningen` | The list with three properties; Lange Hilleweg 73 B has the Operaton story | The list, all detail pages, Dakisolatie |
| `een-woning`    | Koopwoningen goes straight to Lange Hilleweg 73 B                          | The direct redirect and Back behaviour  |
| `geen-woning`   | The empty list message                                                     | The empty state                         |

`?kader=uit` in any URL shows the content without the stand-in frame: what Logius receives.

To add a scenario, add it to `api/src/mock/scenarios.js`, list it in the switch, and add a
row here.

## Checks

| Command                 | What it checks                                                |
| ----------------------- | ------------------------------------------------------------- |
| `npm test`              | Front-end tests, including axe on every page                  |
| `npm run test:api`      | API tests, including every response against the contract      |
| `npm run lint:contract` | `api/openapi.yaml` against the API Design Rules               |
| `npm run lint`          | ESLint, including the rule that pages do not import the frame |
| `npm run check-format`  | Prettier                                                      |
| `npm run build`         | Production build                                              |
| `npm run check-bundle`  | No Operaton URL, `localhost:8081` or `demo:demo` in `dist/`   |

The pre-push hook and both deploy workflows run them. The ADR ruleset is vendored in
`api/.spectral.yaml`; refresh it from `https://static.developer.overheid.nl/adr/ruleset.yaml`
at the start of each iteration and note the date in its first line. developer.overheid.nl is
moving its tooling; if it publishes a successor to the Spectral ruleset, record the switch in
the log.

## Review checklist for a preview

Walk through each changed page:

- [ ] Compare desktop (1440 px) and mobile (375 px) with the Figma export.
- [ ] Repeat with `?kader=uit`: the content must look the same.
- [ ] Run the three scenarios.
- [ ] Use the keyboard only: every link and button can be reached, focus is visible, the H1
      gets focus after navigation.
- [ ] Check one page with a screen reader (NVDA on Windows): title, headings, the energy
      label, and the consent checkbox explanation.
- [ ] Zoom to 200 %: nothing is cut off.
- [ ] Complete Dakisolatie → aannemer → toestemming → gegeven.
- [ ] Note every difference from the design in the log, with the page and width.

## Rules that do not change between iterations

- The front-end holds no business rules. If a page needs a decision, the API delivers it.
  If the API cannot, that is a design question to solve before building (Logius conditions,
  section 7.4.1).
- Contract first: a field a page needs is added to `api/openapi.yaml` before it is used.
- No personal data in URLs, logs or browser storage.
- Copy in the interface is Dutch, B1. Everything else is English.
- Ask before every commit. No Claude attribution. No bypassed hooks.

## Waiting on others

| Item                                                    | From        | Blocks                              |
| ------------------------------------------------------- | ----------- | ----------------------------------- |
| Aansluitvoorwaarden MijnOverheid (code)                 | Logius      | Final choice of stack and packaging |
| Editor access to the Figma file for steven.gort@ictu.nl | Jan (G&B)   | Reading frames directly             |
| Copy for placeholders, FAQ and info buttons             | G&B         | Final copy                          |
| Answers to the spec's open questions                    | G&B, Logius | See the spec                        |

## Iteration log

Newest first. One entry per iteration: date, input, what was built, differences found,
decisions.

### Iteration 1 — started 19 November 2026

- **Input:** the October 2026 UX deck; Figma exports of 19 November 2026 (desktop landing
  page missing); Logius conditions for data sources v15; consent wireframes.
- **Decisions:** see the spec, "Decisions made on 19 November 2026". Also: `Koopwoningen` is
  the list name; rental is out of scope; the DMN gets an `aanbevolen` output, deployed to
  local Operaton only; implementation runs in a separate Claude Code session.
- **Plan:** `docs/superpowers/plans/2026-11-19-mijnoverheid-wonen.md`.
- **DMN:** the patched `bereken_isolatie_opties`, with `aanbevolen`, was deployed to
  `operaton.open-regels.nl` as version 22 on 19 November 2026, and locally as version 2.
- **Built:** (to be filled in when Part 3 merges)
- **Differences from design:** (to be filled in after the preview review)
