# MijnOverheid Wonen Implementation Plan, iterations 1 and 2

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MijnOverheid Wonen content pages on LUX, the NL Design System implementation MijnOverheid uses, in strict TypeScript, backed by a thin LVG API, with roof insulation advice from Operaton and a mocked consent step working from start to finish.

**Architecture:** Part 1 adds the LVG API in `api/`: OpenAPI contract first, plain core handlers, mock sources, the Operaton call moved from the browser, Azure Functions adapters, a Vite plugin for local development, and CI. Part 1b (iteration 2) adds what Logius's conditions of 11 November 2026 ask of the contract and fixes the review findings in #35. Part 2 replaces the single page with a React Router app in TypeScript on LUX: a validated API client, layered pages, the stand-in frame, a strict CSP, Playwright walkthroughs, and the six designed pages. Part 3 adds Dakisolatie and the consent steps and removes the old code. The port to the MijnOverheid codebase is issue #37, not this plan.

**Tech Stack:** React 18, TypeScript (strict), React Router 7, LUX components, tokens and font, SCSS modules, zod, Vite 8, Vitest 5 (Node for the API, jsdom for pages), Testing Library, axe, Playwright with `@axe-core/playwright`, Azure Functions v4 on Node 22 as SWA managed functions, Spectral with the ADR ruleset, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-19-mijnoverheid-wonen-ux-design.md`

**Runbook:** `docs/runbook.md` describes the iteration loop. Parts 0 and 1 are iteration 1 and are done; Part 1b, 2 and 3 are iteration 2. Their history is kept as written.

## Global Constraints

- **Commits:** ask the owner before every `git commit`. Stage, report, stop. One message may approve several named commits.
- **Merges:** the owner merges every pull request. Never push to `acc` or `main`.
- **Attribution:** no Claude attribution anywhere: not in commits, pull requests, issues, comments or files. The owner opens pull requests and issues.
- **Gates:** never `--no-verify`, `HUSKY=0` or `SKIP=`. A failing hook is reported, not bypassed.
- **Dev server and installs:** never start or stop the dev server, and never run `npm ci`. The owner stops the server before dependency changes and runs `npm ci` (root and `api/`) when asked. New dependencies are added with `npm install`, which respects the 14-day cooldown in `.npmrc`; a version npm refuses under the cooldown is not forced.
- **Browser checks:** no browser automation. The owner checks the UI and runs `npm run test:e2e` locally; CI runs it on every pull request. The builder writes the Playwright tests but does not run them.
- **Branches:** each part branches from an up-to-date `acc`, in the main checkout, with no worktree.
- **Naming:** `main` is the "stable release", never "production".
- **Language:** code, comments and docs in English. Interface copy in Dutch, exactly as in the spec.
- **Business rules:** none in `src/`. Cost figures, target values, thresholds, status rules and allowed actions live in `api/`. `src/lib/format.ts` only formats with `Intl`.
- **Front-end layers:** only `src/api/` fetches, and it validates every response with zod. Pages get data from loaders; features and UI components take data and text as props. Browser storage is never read while rendering.
- **Styling:** LUX components and `--lux-*` tokens, SCSS modules, no global CSS beyond `src/styles/global.scss`, no `style` attributes or inline scripts (strict CSP).
- **TypeScript:** new code in `src/` and `e2e/` is TypeScript with `strict`; `npm run typecheck` and `eslint --max-warnings 0` pass.
- **Operaton:** called only from `api/`. `OPERATON_BASE_URL` is `https://operaton.open-regels.nl/engine-rest` on Azure. `localhost:8081`, `demo:demo` and any Operaton URL never appear in `dist/`.
- **Privacy:** no address, BSN or other personal data in URLs, logs or browser storage. Woning ids are opaque.
- **API runtime:** everything in `api/` must run on Node 22; the front-end toolchain stays on the Node in `.nvmrc`.
- **Tests:** Vitest, importing from `vitest` explicitly. API tests run in Node; component and page tests use `// @vitest-environment jsdom` per file and check axe. Fixtures come from the contract's examples, not hand-written data. Walkthroughs are Playwright in `e2e/`.

## Review Focus

1. **Business logic creeping into `src/`:** any arithmetic, comparison or constant that changes meaning. Search `src/` for numbers other than layout values in review.
2. **Single property redirect:** must replace history, or Back loops. Covered in Task 21.
3. **Consent button:** disabled until the box is ticked, and explained to screen readers. Covered in Task 25.
4. **Operaton down:** Dakisolatie must show the API's `burgerActie` and hide the action button, not crash. Covered in Tasks 6 and 24.
5. **Scenario header in production:** ignored unless `LVG_SCENARIOS=on`. Covered in Task 3.
6. **Frame independence:** content pages must not import from `src/frame/`. Covered by a lint rule in Task 15.
7. **DMN patch:** existing outputs must not change, and the API must not invent a recommendation when the DMN gives none. Covered in Tasks 5 and 6.
8. **Contract drift:** zod schemas must mirror `api/openapi.yaml`; both are checked against the contract's examples. Covered in Tasks 11 and 16.
9. **CSP:** no page may need `unsafe-inline` or `unsafe-eval`. Covered in Tasks 19 and 20; every walkthrough fails on a CSP violation.
10. **Layering:** no `fetch` outside `src/api/`, no copy inside UI components. Covered by lint rules in Task 15 and the component tests in Task 17.

---

## Part 0: Documents and clean-up

### Task 0: Publish the design, plan, runbook and CLAUDE.md

Prepared on 19 November 2026 in the planning session, which could not run git. The files are
in the owner's working tree; the owner runs the git steps.

Branch: `docs/mijnoverheid-wonen` from `acc`.

**Files:**

- Create: `CLAUDE.md`, `docs/superpowers/specs/2026-11-19-mijnoverheid-wonen-ux-design.md`, `docs/superpowers/plans/2026-11-19-mijnoverheid-wonen.md`, `docs/runbook.md`, and the Figma exports in `docs/LVG - Wonen - MijnOverheid - Web - G&B/`
- Modify: `docs/superpowers/specs/2026-11-18-frontend-foundation-design.md` (status line only)
- Delete: `docs/Mock-up/` (decision of 19 November 2026)

- [x] **Step 1:** Write the documents and `CLAUDE.md`, and change the foundation spec's status line.
- [x] **Step 2:** Owner: create the branch, `git rm -r "docs/Mock-up"`, check `git grep -n "Mock-up" -- ':!docs/'` returns nothing, and stage the rest.
- [x] **Step 3:** Owner: commit `docs: add MijnOverheid Wonen design, plan, runbook and CLAUDE.md` and `docs: remove superseded Mijn Woning mock-ups`.
- [x] **Step 4:** Owner: push and open a pull request into `acc`. `CLAUDE.md` is not under `docs/` but ends in `.md`, so the deploy workflow still skips the build by design.
- [x] **Step 5:** After merge, the implementation session starts at Task 1.

---

## Part 1: LVG API

Branch: `feat/lvg-api` from `acc`.

### Task 1: API package and contract skeleton

**Files:**

- Create: `api/package.json`, `api/package-lock.json`, `api/host.json`, `api/.funcignore`, `api/openapi.yaml`, `api/.spectral.yaml`, `api/vitest.config.js`
- Modify: `.gitignore`, `.prettierignore` if needed, `eslint.config.mjs` (Node globals for `api/**`)

**Deviation agreed with the owner on 19 November 2026:** also create `api/.npmrc` with `min-release-age=14`. npm reads `.npmrc` from the package being installed, so the root cooldown does not apply inside `api/`.

- [x] **Step 1:** Ask the owner to stop the dev server. In `api/`, create `package.json` (`"type": "module"`, `"engines": { "node": ">=22" }`, `"main": "src/functions/*.js"`) with scripts `test` (`vitest run`) and `lint:contract` (`spectral lint openapi.yaml`). Install `@azure/functions`, `yaml` and, as dev dependencies, `vitest`, `@stoplight/spectral-cli`, `ajv`, `ajv-formats`.
- [x] **Step 2:** `host.json` with version 2.0 and the extension bundle `[4.*, 5.0.0)`. `.funcignore` excludes tests and `openapi.yaml` is kept.
- [x] **Step 3:** Ask the owner to download `https://static.developer.overheid.nl/adr/ruleset.yaml` to `api/.spectral.yaml` and to add a first comment line with the source URL and download date. Vendored so CI does not fetch rules from the network at lint time.
- [x] **Step 4:** Write `api/openapi.yaml` (OAS 3.0.3): `info` with title `LVG Wonen API`, `version: 1.0.0`, contact; server `/api/v1`; the endpoints in the spec's table with request and response schemas; `Accept-Language` parameter (enum `[nl]`, default `nl`) on every operation; `Content-Language` and `API-Version` response headers; responses 200/201, 400, 404, 406, 500, 503 with `application/problem+json` and the extra `burgerActie` property. Schema names in Dutch, matching the spec's example.
- [x] **Step 5:** Run `npm run lint:contract --prefix api`. Expected: no errors. Fix the contract, not the ruleset. Result on 19 November 2026: no errors; one warning, `servers-use-https`, because the server is the relative `/api/v1` this step prescribes.
- [x] **Step 6:** After owner go-ahead, commit `feat(api): add API package and OpenAPI contract`.

### Task 2: Core request handling

**Files:**

- Create: `api/src/core/http.js`, `api/src/core/http.test.js`, `api/src/core/router.js`, `api/src/core/router.test.js`, `api/src/core/contract.js`, `api/test/contract.js`

**Deviation agreed with the owner on 19 November 2026:** also modify `vite.config.js` to exclude `api/**` from the root Vitest run, so `npm test` runs only front-end tests and the API tests run once, through their own package.

**Interfaces:**

- Produces: `handle(request: { method, path, headers, body }) → Promise<{ status, headers, body }>`; `problem(status, title, detail, burgerActie)`; `contract.js` exports the parsed contract for `/api/v1/openapi.json`; `test/contract.js` exports `expectValidResponse(operationId, response)` using ajv on the contract's schemas.

- [x] **Step 1: Write failing tests:** unknown path gives 404 problem+json with `burgerActie`; `Accept-Language: en` gives 406; every response has `Content-Language: nl` and `API-Version: 1.0.0`; `GET /api/v1/openapi.json` returns the contract as JSON.
- [x] **Step 2:** Run `npm test --prefix api`. Expected: FAIL.
- [x] **Step 3:** Implement `http.js` and `router.js`: a small table of `{ method, pattern, operationId, handler }`, path parameters, header handling, and a catch-all that turns thrown errors into a 500 problem with `burgerActie: 'Probeer het later opnieuw.'`, logging the error without request data.
- [x] **Step 4:** Run tests. Expected: PASS.
- [x] **Step 5:** After owner go-ahead, commit `feat(api): add core request handling`.

### Task 3: Mock sources and scenarios

**Files:**

- Create: `api/src/mock/scenarios.js`, `api/src/sources/registers.js`, `api/src/sources/registers.test.js`, `api/src/core/scenario.js`, `api/src/core/scenario.test.js`
- Source for data: `src/services/mockPropertyData.js` (Rotterdam property and building data, contractors)

**Decision agreed with the owner on 19 November 2026:** the Rotterdam property keeps its existing mock values (WOZ € 317.000, cadastral size 158 m², label C, build year 1990); the design values only fill the fields it lacked. The other two properties use the design values, with invented postcodes, parcels and WOZ numbers. The photos use `public/foto-placeholder.svg`.

**Interfaces:**

- Produces: `resolveScenario(headers, env) → 'geen-woning' | 'een-woning' | 'drie-woningen'`; `registers.listWoningen(scenario)`, `getWoning(scenario, id)`, `getKadaster`, `getWoz`, `getEnergielabel`, `getDak`, `getAannemers`. All async; unknown id rejects with a not-found error.

- [x] **Step 1: Write failing tests:** the header is honoured only when `env.LVG_SCENARIOS === 'on'`; without it the scenario is `drie-woningen`; unknown scenario names fall back to `drie-woningen`; `een-woning` lists one property; `geen-woning` lists none; ids are opaque (no digits of a postcode or house number); returned objects are copies.
- [x] **Step 2:** Run tests. Expected: FAIL.
- [x] **Step 3:** Implement. The Rotterdam property gets id `w-7f3a`, the design's other two get `w-2c91` (Straatnaam 23, Drechtstad, label A, 1994) and `w-b04e` (Regenboogweg 9, Nintendorp, label C, 1967). The rental property from the design is not mocked: rental is out of scope. Give the Rotterdam property's building data a roof area, `dak.oppervlakte_m2`, separate from `gebouw.vloeroppervlakte_m2`; use 120 so today's results stay comparable. Fill the Kadaster, WOZ and energy label fields with the values shown in the designs; the photos use `public/perceel-1560.png` and a placeholder.
- [x] **Step 4:** Run tests. Expected: PASS.
- [x] **Step 5:** After owner go-ahead, commit `feat(api): add mock registers and scenarios`.

### Task 4: Register resources

**Files:**

- Create: `api/src/resources/wonen.js`, `woningen.js`, `kadaster.js`, `woz.js`, `energielabel.js`, each with a test

**Interfaces:**

- Consumes: Tasks 2 and 3.
- Produces: handlers for `getWonen`, `listWoningen`, `getWoning`, `getKadaster`, `getWoz`, `getEnergielabel`, registered in the router.

**Note, 19 November 2026:** the contract gained `adresMetPlaats` on `WoningInLijst`, because the list shows the address with the town (`Straatnaam 23, Drechtstad`). Copy and links that G&B or the open questions still have to supply are built as `{…}` placeholders, with links pointing to `#nog-niet-beschikbaar`.

- [x] **Step 1: Write failing tests**, one file per resource. Each asserts the fields the spec names for its page and calls `expectValidResponse`. Specifically: `listWoningen` returns `weergave` `direct`, `lijst` or `leeg` per scenario; `getWoning` returns four sections each with `status`; `getEnergielabel` returns `objectAanduiding`, a `geldigheid` status (`geldig` or `verlopen`, decided in the API from the dates), and the action `bekijk-dakisolatie` only for a property with building data.
- [x] **Step 2:** Run tests. Expected: FAIL.
- [x] **Step 3:** Implement. Dates go out as ISO dates; amounts as numbers in euros; texts for info buttons as plain Dutch strings.
- [x] **Step 4:** Run tests. Expected: PASS.
- [x] **Step 5:** After owner go-ahead, commit `feat(api): add register resources`.

### Task 5: Bring the DMN into the repository and add `aanbevolen`

**Files:**

- Create: `dmn/bereken_isolatie_opties.dmn`, `dmn/README.md`, `scripts/deploy-dmn-local.sh`

- [x] **Step 1:** Ask the owner to save the deployed source:
      `curl -s https://operaton.open-regels.nl/engine-rest/decision-definition/key/bereken_isolatie_opties/xml`
      returns JSON with `dmnXml`. Write that string, unescaped, to `dmn/bereken_isolatie_opties.dmn`.
      Commit it unchanged first, so the patch is a reviewable diff. Note the deployed version
      and id in `dmn/README.md`.
- [x] **Step 2:** After owner go-ahead, commit `chore(dmn): add bereken_isolatie_opties as deployed (version 21)`.
- [x] **Step 3:** Add an output column `aanbevolen` (label `Aanbevolen`, `typeRef="boolean"`) to the
      decision table. Every rule gets a value: `true` for the rule with the recommendation text
      (target R 6.0), `false` for the others. Do not change the decision key, inputs or other
      outputs. Keep FEEL as Operaton accepts it (for example `not(x)`, not `not x`).
- [x] **Step 4:** `scripts/deploy-dmn-local.sh` posts the file to
      `http://localhost:8081/engine-rest/deployment/create` as multipart form data
      (`deployment-name=lvg-dmn`, `deploy-changed-only=true`, the file) with the local login from
      `OPERATON_USER` / `OPERATON_PASSWORD` (default `demo`). It refuses any other host.
- [x] **Step 5:** Owner check: run the script against local Operaton, then evaluate the decision for
      target 6.0 and 4.0 with the inputs from `src/services/insulationParams.js`. Expected:
      `aanbevolen` is `true` for 6.0 and `false` for 4.0; all other outputs are unchanged from
      the call before the patch.
      Result on 19 November 2026: local version 2; `aanbevolen` is `true` for 6.0 and `false` for 4.0; no other output changed.
      On the same day the owner deployed it to `operaton.open-regels.nl` as version 22; its XML matches the file and it gives the same results without a login.
- [x] **Step 6:** `dmn/README.md` describes the decision, its inputs and outputs, the deploy script,
      and that `operaton.open-regels.nl` still runs version 21 without `aanbevolen` until the
      owner deploys it there.
- [x] **Step 7:** After owner go-ahead, commit `feat(dmn): add the aanbevolen output`.

### Task 6: Operaton and the Dakisolatie resource

**Files:**

- Create: `api/src/operaton/client.js`, `api/src/operaton/client.test.js`, `api/src/operaton/parameters.js`, `api/src/resources/dakisolatie.js`, `api/src/resources/dakisolatie.test.js`
- Source to move: `src/services/operatonService.js`, `src/services/operatonService.test.js`, `src/services/insulationParams.js` (deleted in Task 19)

**Interfaces:**

- Produces: `evaluateIsolatie(params, { baseUrl, user, password, fetch })`; `buildIsolatieParams(dak)`; `TARGET_R_VALUES`; handler `getDakisolatie`.

**Note, 19 November 2026:** `parameters.js` also exports `operatonConfig(env)`. The demo login is the default only for the local engine; another engine gets no login unless one is set, and an empty `OPERATON_USER` means none. A property without building data answers 404 on `getDakisolatie`. Checked against both the local and the public Operaton: identical results, R 6.0 recommended.

- [x] **Step 1:** Move the existing Operaton tests to `client.test.js`, adapted: the URL is built from `baseUrl`; with `user` and `password` set the request has a Basic `Authorization` header, without them it has none; payload and types are unchanged; a non-OK response throws.
- [x] **Step 2: Write failing tests** for `getDakisolatie`: four options; `aanbevolen` taken from the DMN output per option, and all `false` when the DMN result has no `aanbevolen` output (version 21), with no fallback rule in the API; the roof area sent to Operaton is `dak.oppervlakte_m2`, not floor area; `kostenPerM2Eur` rounded to whole euros; amounts rounded to whole euros and payback to one decimal; `uitgangspunten` lists λ, material price and labour price; actions `deel-met-aannemer` and `meer-over-subsidie`. With `fetch` rejecting: status 200, `advies.status: 'niet-beschikbaar'`, a `burgerActie`, and no `deel-met-aannemer` action. Each case calls `expectValidResponse`.
- [x] **Step 3:** Run tests. Expected: FAIL.
- [x] **Step 4:** Implement. Configuration comes from `process.env.OPERATON_BASE_URL`, `OPERATON_USER`, `OPERATON_PASSWORD`. A timeout of 10 seconds per call. The four calls run in parallel, as today.
- [x] **Step 5:** Run tests. Expected: PASS.
- [x] **Step 6:** After owner go-ahead, commit `feat(api): move the roof insulation decision to the API`.

### Task 7: Contractors and consent

**Files:**

- Create: `api/src/resources/aannemers.js`, `api/src/resources/toestemmingen.js`, both with tests

**Interfaces:**

- Produces: `getAannemers`, `createToestemming`, `getToestemming`.

**Note, 19 November 2026:** the contract said required data sets were shared even when left out of the request; it now says the request must contain them, matching this task's 400. Contractors and consent are only offered for a property with building data, like Dakisolatie (404 otherwise). An unknown data set or a duration that is not offered also gives 400, and a consent is visible only to the simulated citizen who gave it.

- [x] **Step 1: Write failing tests:** contractors come without ratings; each response lists the four data sets from the spec with `verplicht` and default `aan`, and durations 7, 14, 30 with default 14; `createToestemming` rejects a missing contractor (400, `burgerActie: 'Kies een aannemer.'`) and an attempt to switch off a required set (400); on success it returns 201 with a kenmerk `TS-YYYY-MMDD-NNNN`, `geldigTot` computed by the API, and a `Location` header; `getToestemming` returns it; an unknown kenmerk gives 404.
- [x] **Step 2:** Run tests. Expected: FAIL.
- [x] **Step 3:** Implement with an in-memory store, cleared when the process restarts.
- [x] **Step 4:** Run tests. Expected: PASS.
- [x] **Step 5:** After owner go-ahead, commit `feat(api): add contractors and mocked consent`.

### Task 8: Azure Functions adapters and local development

**Files:**

- Create: `api/src/functions/lvg.js`, `vite/lvgApiPlugin.js`
- Modify: `vite.config.js`, `public/staticwebapp.config.json`, `README.md` (local setup)

**Note, 19 November 2026:** the plugin loads the API with Node's own `import()`, not Vite's module loader, which cannot run the API's CommonJS dependencies; so API changes need a dev server restart. It does not apply under Vitest. The API reads its settings from `request.env` when a host passes them (the plugin), else from `process.env` (Azure). Removing the proxy stops the old page's calculation on `localhost:5173` until Part 3; deployed sites are unaffected. Both adapters have tests.

**Deviation agreed with the owner on 19 November 2026:** `Accept-Language` is negotiated as in HTTP instead of matched exactly. The API accepts a request when Dutch is acceptable anywhere in the list (`nl`, `nl-NL` or `*`, with q above 0) and answers 406 only when Dutch is not acceptable at all. Found in the Step 5 check: a browser sends its own list, such as `nl-NL,nl;q=0.9,en;q=0.8`, which the exact match refused. Responses stay Dutch with `Content-Language: nl`; the contract's parameter description says so.

- [x] **Step 1:** In `api/src/functions/lvg.js`, register one HTTP function with route `v1/{*path}`, anonymous auth level, all methods used, that converts the Azure request to the core `request`, calls `handle`, and returns the result.
- [x] **Step 2:** In `vite/lvgApiPlugin.js`, a dev-only plugin (`apply: 'serve'`) that mounts the same `handle` on `/api/` using Connect middleware. It reads `OPERATON_*` and `LVG_SCENARIOS` from `loadEnv(mode, cwd, ['OPERATON_', 'LVG_'])`, defaults to `http://localhost:8081/engine-rest`, `demo`/`demo` and `LVG_SCENARIOS=on`, and passes them to the core as configuration, never to the client.
- [x] **Step 3:** In `vite.config.js`, remove the `/api/engine-rest/...` proxy and add the plugin.
- [x] **Step 4:** In `staticwebapp.config.json`, add `"platform": { "apiRuntime": "node:22" }` and exclude `/api/*` from `navigationFallback`.
- [x] **Step 5:** Owner check: with local Operaton running, the owner runs `npm ci --prefix api` and `npm run dev`, then opens `http://localhost:5173/api/v1/woningen/w-7f3a/dakisolatie`. Expected: JSON with four options.
      Result on 19 November 2026: four options from the local Operaton, R 6 recommended.
- [x] **Step 6:** After owner go-ahead, commit `feat(api): add Azure Functions adapter and local dev plugin`.

### Task 9: CI and hooks

**Files:**

- Modify: `.github/workflows/azure-lvg-acc.yml`, `.github/workflows/azure-lvg-stable.yml`, `.husky/pre-push`, `package.json` (scripts), `SECURITY-PIPELINE.md`, `scripts/check-deps.sh` (also check `api/`)

**Deviation agreed with the owner on 19 November 2026:** `check-bundle` is phased. Until Task 19 it fails on `localhost:8081` and `demo:demo` only, because the old page in `src/` still calls `operaton.open-regels.nl` from the browser and the full check would fail every deployment. Task 19 adds `operaton.open-regels.nl`.

**Note, 19 November 2026:** `api/package.json` gained `postinstall`, which writes the install marker `scripts/check-deps.sh` compares, so `deps:check` (and `npm run dev`) also reports a stale `api/` install. The daily dependency audit and `audit:signatures` still read the root lockfile only; `SECURITY-PIPELINE.md` records that.

**Deviation agreed with the owner on 19 November 2026:** the API is installed, contract-checked and tested on Node 22 (`22.23.4`, as in `ronl-business-api`), which the managed functions run. To keep the front-end on the Node in `.nvmrc`, the API steps run after the build and bundle check, just before the prune and deploy, instead of right after the root `npm ci`.

- [x] **Step 1:** Root scripts: `test:api` (`npm test --prefix api`), `lint:contract` (`npm run lint:contract --prefix api`), `check-bundle` (a script that fails if `dist/` contains `localhost:8081`, `demo:demo` or `operaton.open-regels.nl`).
- [x] **Step 2:** In both workflows, after the root `npm ci`: `npm ci --prefix api`, `npm run lint:contract`, `npm run test:api`. After the build: `npm run check-bundle`. Before deploy: `npm prune --omit=dev --prefix api`. Deploy with `api_location: 'api'` and `skip_api_build: true`.
- [x] **Step 3:** The owner sets the app settings `OPERATON_BASE_URL` on both Static Web Apps, and `LVG_SCENARIOS=on` on the acceptance app only (previews inherit it).
      Done on 19 November 2026: both apps have `OPERATON_BASE_URL`, the acceptance app also `LVG_SCENARIOS=on`; Azure copies settings to preview environments.
- [x] **Step 4:** Pre-push hook: add `npm run test:api` and `npm run lint:contract` after `npm test`.
- [x] **Step 5:** `SECURITY-PIPELINE.md`: the API's own lockfile, the vendored ADR ruleset and the bundle check.
- [x] **Step 6:** After owner go-ahead, commit `ci: build, test and deploy the LVG API`.

### Task 10: Ship Part 1

- [x] **Step 1:** Push and open a pull request into `acc`. On the preview, the owner opens `/api/v1/openapi.json`, `/api/v1/woningen` and `/api/v1/woningen/w-7f3a/dakisolatie`. Expected: valid JSON, the dakisolatie options calculated by `operaton.open-regels.nl`. The existing page still works.
      Found on the first preview, 19 November 2026: every `/api` address answered 404. `main` in `api/package.json` was the glob `src/functions/*.js`, which also matches `lvg.test.js`; after `npm prune --omit=dev` that file cannot load (`vitest` is gone), and a function app whose entry point fails to load registers no functions. `main` now names `src/functions/lvg.js` only.
      The Part 1 review found two more, fixed on the same branch: the Vite plugin no longer sets the demo login itself, so `operatonConfig` alone decides and a remote `OPERATON_BASE_URL` gets no login; and the Operaton client rejects an empty decision result or one without the amounts, so the advice is reported as unavailable instead of as zero amounts.
- [x] **Step 2:** After the owner merges, promote `acc` to `main` by pull request when the owner says so.
      Done on 19 November 2026: Part 1 is live on `acc.lvg.open-regels.nl` and `lvg.open-regels.nl`.

---

## Part 1b: API changes for iteration 2

Added on 19 November 2026 after Logius's code and authentication conditions of 11 November
2026 (spec, "Decisions made on 19 November 2026", Iteration 2). Contract first, then the API.
Closes #35.

Task numbers inside Parts 0 and 1 are kept as written in iteration 1. Where they point
forward: the old page is now removed in Task 26 (was Task 19), and `operaton.open-regels.nl` is
added to `check-bundle` in Task 19, when the old page leaves the bundle.

Branch: `feat/api-iteration-2` from `acc`.

### Task 11: Contract: version policy, examples and status-bound advice

**Files:**

- Modify: `api/openapi.yaml`, `api/src/core/contract.js` (only if `API_VERSION` is not read from the contract already)
- Create: `api/README.md`, `api/CHANGELOG.md`, `api/test/examples.test.js`

**Interfaces:**

- Produces: an example under every response's media type (`examples.<name>.value`) in `api/openapi.yaml`; `Advies` as `oneOf` on `status`; `getOpenapi` without a 406 response; `info.version: 1.1.0`.

- [x] **Step 1: Write the failing test** `api/test/examples.test.js`: for every operation and every response with content, at least one example exists, and each example validates against that response's schema with the same ajv set-up as `api/test/contract.js` (reuse its exports; add an export for the schema lookup if needed). A second test builds an `Advies` with `status: 'berekend'` and no `opties`, and one with `status: 'niet-beschikbaar'` and no `melding`, and expects both to fail validation.
- [x] **Step 2:** Run `npm run test:api`. Expected: FAIL (no examples; `Advies` accepts both broken objects).
- [x] **Step 3:** In `api/openapi.yaml`:
  - Split `Advies` into `AdviesBerekend` (required `status` with enum `[berekend]`, `berekendOp`, `opties`, `uitgangspunten`) and `AdviesNietBeschikbaar` (required `status` with enum `[niet-beschikbaar]`, `melding`), and make `Advies` a `oneOf` of the two with a `discriminator` on `status`.
  - Add examples for every response. Take the bodies from the handlers' real output for scenario `drie-woningen` (property `w-7f3a` for the property resources), the Operaton-unavailable case for `getDakisolatie`, and one example per problem response. Keep `{…}` placeholders as the handlers return them.
  - Remove `406` from `getOpenapi`, and say in its description that the contract is readable in any language.
  - Add a "Versiebeleid" section to `info.description` with the policy from the spec, section "Version policy".
  - Set `info.version` to `1.1.0`.
- [x] **Step 4:** Write `api/README.md`: what the API is, how to run and test it (pointing to `docs/runbook.md`), the version policy (as in the spec), and where the examples live. Write `api/CHANGELOG.md` with `1.0.0` (19 November 2026, first version) and `1.1.0` (this part: examples, `Advies` bound to status, contract readable in any language, the #35 fixes).
- [x] **Step 5:** Run `npm run test:api` and `npm run lint:contract`. Expected: PASS; the linter shows no errors (the known `servers-use-https` warning stays). If a handler's response no longer validates, fix the handler, not the schema, unless the spec says otherwise.
      Notes, 19 November 2026: the consent request body has an example as well (the spec asks for example requests too). `getOpenapi` no longer lists the `Accept-Language` parameter, since it ignores it. The 500 and 503 examples are written by hand: no handler returns 503, and the 500 body is the router's fixed answer. The `getOpenapi` example is a shortened contract without `servers`, because the ADR linter applies `servers-use-https` to it. The two 406 tests in `src/core/http.test.js` now use `/woningen`, as the contract no longer declares 406 for `getOpenapi`; Task 12 makes the handler match.
- [x] **Step 6:** After owner go-ahead, commit `feat(api): add version policy, examples and status-bound advice to the contract`.

### Task 12: Request handling fixes from #35

**Files:**

- Modify: `api/src/core/router.js`, `api/src/core/router.test.js`, `api/src/resources/toestemmingen.js`, `api/src/resources/toestemmingen.test.js`

- [x] **Step 1: Write failing tests:**
  - `POST /api/v1/woningen/w-7f3a/toestemmingen` with body `null` (string `'null'` and the value `null`) answers 400 `Aanvraag niet leesbaar`, not 500. The same for a JSON array and a JSON string.
  - `GET /api/v1/woningen/%E0` answers 404 problem+json with the not-found `burgerActie`, not 500.
  - `Accept-Language: nl;q=0, *` answers 406; `Accept-Language: nl-NL;q=0, *` answers 406; `Accept-Language: *;q=0.5` is accepted; `Accept-Language: en-US,en;q=0.9` still answers 406 on `/woningen`.
  - `GET /api/v1/openapi.json` with `Accept-Language: en-US,en;q=0.9` answers 200 with the contract.
- [x] **Step 2:** Run `npm run test:api`. Expected: FAIL on each.
- [x] **Step 3:** Implement:
  - `leesAanvraag` accepts only a plain object; anything else throws the existing 400.
  - The router catches `URIError` from `decodeURIComponent` and answers the route's 404.
  - `acceptsDutch` follows RFC 9110: an explicit `nl` or `nl-*` range with `q=0` makes Dutch unacceptable before `*` is considered; otherwise Dutch is acceptable when `nl`, `nl-*` or `*` has q above 0.
  - `getOpenapi` skips language negotiation.
- [x] **Step 4:** Run `npm run test:api` and `npm run lint:contract`. Expected: PASS.
      Notes, 19 November 2026: the existing negotiation tests in `src/core/http.test.js` moved from `/openapi.json` to `/woningen`, because the contract is now served in any language. A malformed path answers the router's own 404 (`Niet gevonden`, `Ga naar de pagina Wonen in MijnOverheid.`), which every route declares. A consent request without a body now also answers 400 `Aanvraag niet leesbaar`.
- [x] **Step 5:** After owner go-ahead, commit `fix(api): reject unreadable bodies and paths, and negotiate language per RFC 9110`.

### Task 13: Operation and privacy fixes from #35

**Files:**

- Modify: `api/src/resources/toestemmingen.js`, `api/src/operaton/parameters.js`, `api/src/resources/woningen.js`, `api/src/resources/dakisolatie.js`, `api/src/core/router.js`, their tests, `api/README.md`, `SECURITY-PIPELINE.md` ("The LVG API")

- [x] **Step 1: Write failing tests:**
  - The consent store keeps consents of today and the previous day only; a consent from two days ago gives 404. Use an injectable clock (`vandaag` already exists in `shared.js`; make it overridable for tests).
  - Without `request.env` and without `process.env.OPERATON_BASE_URL`, `getDakisolatie` reports the advice as unavailable without calling `localhost:8081`, and logs once `[lvg-api] OPERATON_BASE_URL is not set`. With `request.env` (a development host), the local default still applies.
  - When a source or Operaton throws an error whose message contains a URL, the logged line contains only the error name (`TypeError`, `Error`), not the message. Spy on `console.error`.
- [x] **Step 2:** Run `npm run test:api`. Expected: FAIL.
- [x] **Step 3:** Implement. Document in `api/README.md` that consent numbering is per instance and per day, and is a mock property: two instances can hand out the same reference. In `SECURITY-PIPELINE.md`, note that the API logs error names only.
- [x] **Step 4:** Run `npm run test:api`. Expected: PASS.
      Notes, 19 November 2026: the clock is Vitest's fake `Date` (`vi.setSystemTime`), which `vandaag()` already follows, so no override was added to `shared.js`. `operatonConfig(env, { lokaalStandaard })` returns null without `OPERATON_BASE_URL` when the host passes no `request.env`. Errors are logged through `errorName()` in `src/core/http.js`. `docs/runbook.md` now says that the SWA CLI check needs `OPERATON_BASE_URL` in the shell.
- [x] **Step 5:** After owner go-ahead, commit `fix(api): cap the consent store, require the Operaton setting on Azure, and log error names only`.

### Task 14: Ship Part 1b

- [x] **Step 1:** Run `npm run lint`, `npm test`, `npm run test:api`, `npm run lint:contract`, `npm run check-format`. Expected: all pass.
- [x] **Step 2:** Push and ask the owner to open a pull request into `acc` with `Closes #35` in the description. On the preview, the owner opens `/api/v1/openapi.json` (now `1.1.0`, with examples) and `/api/v1/woningen/w-7f3a/dakisolatie`. Expected: valid JSON; the `API-Version` header says `1.1.0`.
      Done on 19 November 2026 as #39; the build session opened it (the owner returned that to build sessions, see `CLAUDE.md`). A review of the branch found no critical issues; its minor fixes are on the branch, the rest is #40.
      After #39 merged: the review fixes moved to `fix/api-review-and-mock`, with one addition. The Rotterdam property was a real one, so the mock (API and old page), its tests, the contract examples, the spec and the runbook now use Voorbeeldlaan 73 B, 3000 SS Rotterdam, BAG id `0599019999999999`, parcel `Rotterdam Z 99999` and WOZ number `059999999999` (owner decision, #40). The G&B design PDFs for the WOZ page still show the real address.
- [x] **Step 3:** After the owner merges, promote `acc` to `main` by pull request when the owner says so.

---

## Part 2: Pages on LUX, in TypeScript

Branch: `feat/wonen-pages` from `acc`.

### Task 15: Stack switch

**Files:**

- Create: `tsconfig.json`, `src/vite-env.d.ts`, `src/styles/global.scss`
- Modify: `package.json`, `package-lock.json`, `eslint.config.mjs`, `vite.config.js`, `index.html` (`lang="nl"`), `.husky/pre-push`, `.github/workflows/azure-lvg-acc.yml`, `.github/workflows/azure-lvg-stable.yml`, `lint-staged` in `package.json` (add `ts,tsx,scss`)
- Delete: `tailwind.config.js`, `postcss.config.js`

- [x] **Step 1:** Ask the owner to stop the dev server. Install `react-router@7`, `@lux-design-system/components-react`, `@lux-design-system/design-tokens`, `@lux-design-system/font`, `zod`; dev dependencies `typescript`, `typescript-eslint`, `sass`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `axe-core`, `yaml`. Uninstall `tailwindcss`, `autoprefixer`, `postcss`, `lucide-react`. Then run `npm ls @utrecht/component-library-react` and report the versions LUX pulls in, and any new peer warnings, to the owner before committing.
- [x] **Step 2:** `tsconfig.json`: `strict: true`, `noUncheckedIndexedAccess: true`, `jsx: react-jsx`, `moduleResolution: bundler`, `noEmit: true`, `types: ["vite/client"]`, `include: ["src/**/*.ts", "src/**/*.tsx", "e2e/**/*.ts"]`. The old `.jsx` files stay outside `include` until Part 3 removes them. Add the root script `typecheck` (`tsc --noEmit`).
- [x] **Step 3:** ESLint: add `typescript-eslint`'s recommended type-checked config for `src/**/*.{ts,tsx}` and `e2e/**/*.ts`; change the `lint` script to `eslint . --max-warnings 0`; forbid imports from `src/frame/` in `src/pages/**`, `src/features/**` and `src/components/**`, with `no-restricted-imports`, and forbid the global `fetch` outside `src/api/**` with `no-restricted-globals`.
- [x] **Step 4:** `src/styles/global.scss` imports `@lux-design-system/font` and the LUX token CSS, and nothing else. It is imported once, from the new entry in Task 17; until then `src/main.jsx` keeps rendering the old page, which will look unstyled. That is expected.
- [x] **Step 5:** Pre-push hook and both workflows: add `npm run typecheck` after `npm run lint`.
- [x] **Step 6:** Run `npm run lint`, `npm run typecheck`, `npm test`. Expected: pass.
      Deviations agreed with the owner, 19 November 2026: `typescript` is pinned to `~6.0.3`, because `typescript-eslint` 8.72 supports `typescript <6.1.0` and the newest version within the cooldown is 7.0. `@testing-library/dom@^10`, `@types/react@^18` and `@types/react-dom@^18` are added: the first two are peers of `@testing-library/react`, and strict TypeScript needs the React types. `lucide-react` stays installed until Task 26, which deletes the last files that import it; removing it here would break the build and the dev server until Task 17.
      Notes: LUX pulls in `@utrecht/component-library-react` 7.1.0 and `@utrecht/component-library-css` 6.1.0, on React 18.3.1; no unmet peers. `sass` brings the optional `@parcel/watcher`, whose install script npm skipped (not in `allowScripts`), noted in `SECURITY-PIPELINE.md`. `global.scss` imports the light MijnOverheid token set (`dist/mijnoverheid/light/lg.css`), as the designs are light only. The `fetch` and frame-import rules apply to the new TypeScript code; the old `.jsx` page still fetches until Task 26.
      Added with the owner (from the #37 check): `src/features/` and `src/components/` may not import values from `src/api/` (`@typescript-eslint/no-restricted-imports`, type imports allowed), so UI components cannot call the API; the frame rule uses the same mechanism.
- [x] **Step 7:** After owner go-ahead, commit `build: switch to TypeScript, LUX, SCSS modules and React Router`.

### Task 16: API client and response schemas

**Files:**

- Create: `src/api/schemas.ts`, `src/api/schemas.test.ts`, `src/api/client.ts`, `src/api/client.test.ts`, `src/api/wonen.ts`, `src/api/acties.ts`, `src/api/acties.test.ts`, `src/lib/format.ts`, `src/lib/format.test.ts`, `src/test/contractExamples.ts`

**Interfaces:**

- Produces: zod schemas and inferred types for every response in `api/openapi.yaml` (`Wonen`, `WoningenOverzicht`, `Woning`, `Kadaster`, `Woz`, `Energielabel`, `Dakisolatie`, `AannemersOverzicht`, `Toestemming`, `Probleem`); `apiGet<T>(path, schema)`, `apiPost<T>(path, body, schema)` that send `Accept-Language: nl` and `X-LVG-Scenario` (from `sessionStorage`, default `drie-woningen`), abort after 15 seconds, and throw `ApiError { status, title, detail?, burgerActie }`; one function per operation in `wonen.ts`; `routeVoorActie(actie, context) → { naar: string } | { extern: string } | null` in `acties.ts`; `formatEuro`, `formatDatum`, `formatGetal`; `contractExamples(operationId, status)` for tests, which reads `api/openapi.yaml` with `yaml`.

- [x] **Step 1: Write failing tests:**
  - `schemas.test.ts`: every 2xx example in the contract parses with its schema; removing a required field from each makes it fail; an `Advies` with `status: 'berekend'` and no `opties` fails.
  - `client.test.ts` (with a stubbed `fetch`): headers sent; a problem+json response becomes `ApiError` with its `burgerActie`; a body that fails its schema becomes `ApiError` with `burgerActie: 'Probeer het later opnieuw.'`; a network failure becomes `ApiError` with `burgerActie: 'Controleer uw internetverbinding en probeer het opnieuw.'`; after 15 seconds (fake timers) the request is aborted with `burgerActie: 'Probeer het later opnieuw.'`.
  - `acties.test.ts`: `bekijk-dakisolatie` maps to `/nl/wonen/koopwoningen/w-7f3a/energielabel/dakisolatie`; `deel-met-aannemer` to `…/dakisolatie/aannemer`; an absolute `https` href becomes external; an unknown type gives `null`.
  - `format.test.ts`: `4080` → `€ 4.080`; `'2025-01-01'` → `1 januari 2025`; `2.8` → `2,8`.
- [x] **Step 2:** Run `npm test`. Expected: FAIL.
- [x] **Step 3:** Implement. Mirror the contract's required fields and enums exactly; use `z.discriminatedUnion('status', …)` for `Advies`. `acties.ts` holds only the type-to-route table; it decides nothing about whether an action is offered.
- [x] **Step 4:** Run `npm test` and `npm run typecheck`. Expected: PASS.
      Notes, 19 November 2026: the spec names no route for placeholder links, so `acties.ts` exports `NIET_BESCHIKBAAR_PAD = '/nl/wonen/nog-niet-beschikbaar'`, which Task 17 routes to `NietBeschikbaarPage`. The scenario is kept under the `sessionStorage` key `lvg-scenario` (`SCENARIO_SLEUTEL` in `client.ts`), which Task 18 writes. `contractExamples.ts` reads the contract with Vite's `?raw` import, so no `@types/node` is needed; it also exports `contractExample()` for the first example. The client's error titles (`Geen verbinding`, `Geen antwoord`, `Onverwacht antwoord`, `Er ging iets mis`) are not in the spec; the `burgerActie` texts are. `formatEuro` shows cents only when an amount has them (`trailingZeroDisplay: 'stripIfInteger'`), so it never rounds.
- [x] **Step 5:** After owner go-ahead, commit `feat: add the validated API client`.

### Task 17: Router, layers and shared UI components

**Files:**

- Create: `src/main.tsx`, `src/routes.tsx`, `src/components/` (`ContentCard`, `DataList`, `Breadcrumb`, `PageTitle`, `InfoToggle`, `EnergielabelSchaal`, `ContactCard`, `FaqCard`, `Tabel`, `LoadState`, `ErrorState`, `icons/`), each with a `.module.scss` and a `.test.tsx`; `src/test/axe.ts`; `src/pages/NietGevondenPage.tsx`, `src/pages/NietBeschikbaarPage.tsx`; `src/lib/buildInfo.ts`, `src/lib/siteInfo.ts` (from the `.js` files, with their tests)
- Modify: `index.html` (entry `src/main.tsx`), `vite.config.js` (import of `siteInfo`)
- Delete: `src/main.jsx`, `src/App.jsx`, `src/index.css`, `src/lib/buildInfo.js`, `src/lib/siteInfo.js` and their `.test.js` files

**Interfaces:**

- Consumes: Task 16.
- Produces: `expectNoAxeViolations(container)` in `src/test/axe.ts`; the route table from the spec with loaders calling `src/api/wonen.ts` and an `errorElement` that renders `ErrorState` (or `NietGevondenPage` for 404); basename from `import.meta.env.VITE_BASE_PATH ?? '/'`; `/` redirects to `/nl/wonen`. Routes for later tasks render `NietBeschikbaarPage` for now.

- [ ] **Step 1: Write failing tests** per component: renders from props only (no fetch: `fetch` is stubbed to throw), takes all text as props, and has no axe violations. `EnergielabelSchaal` renders seven blocks, `aria-hidden`, with visually hidden `Energielabel C` for `{ klasse: 'C', naam: 'C' }` and `Energielabel A++` for `{ klasse: 'A', naam: 'A++' }`. `PageTitle` renders the breadcrumb and the back link, sets `document.title` to `[titel] - MijnOverheid`, and moves focus to the H1. `InfoToggle` toggles `aria-expanded` and shows its text. `Tabel` renders a `caption`.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement on LUX components where the spec's shared-patterns table names one, local components otherwise, styled with SCSS modules and `--lux-*` tokens only. No `style` attributes in markup. Breakpoint: 768 px for breadcrumb versus back link.
- [ ] **Step 4:** Run `npm test`, `npm run typecheck`, `npm run lint`. Expected: PASS.
- [ ] **Step 5:** After owner go-ahead, commit `feat: add the router and shared UI components on LUX`.

### Task 18: Stand-in frame and scenario switch

**Files:**

- Create: `src/frame/StandInFrame.tsx`, `src/frame/ScenarioSwitch.tsx`, `src/frame/BuildLine.tsx`, `src/frame/*.module.scss`, `src/frame/StandInFrame.test.tsx`
- Modify: `src/main.tsx`
- Delete: `src/components/Footer.jsx` (its content moves to `BuildLine`)

- [ ] **Step 1: Write failing tests:** the band text `Nagebootst MijnOverheid-kader. Geen onderdeel van de oplevering.` is shown; `?kader=uit` renders only the content; changing the scenario writes `sessionStorage` in the change handler and revalidates the router; nothing reads `sessionStorage` during render (spy on `Storage.prototype.getItem` during the first render); the build line shows `local build` without build variables; no axe violations.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement as the spec describes. Header and side-menu items other than Wonen are inert text, not links.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** After owner go-ahead, commit `feat: add the stand-in MijnOverheid frame and scenario switch`.

### Task 19: Strict CSP, full bundle check and a preview server with the API

**Files:**

- Modify: `public/staticwebapp.config.json`, `scripts/check-bundle.mjs`, `vite/lvgApiPlugin.js`, `vite/lvgApiPlugin.test.js`, `vite.config.js`
- Create: `vite/swaHeadersPlugin.js`, `vite/swaHeadersPlugin.test.js`

- [ ] **Step 1: Write failing tests:** `swaHeadersPlugin` adds every `globalHeaders` entry of `public/staticwebapp.config.json` to preview responses, and nothing to dev-server responses; `lvgApiPlugin` also serves `/api/` in `vite preview` with the same settings as in `vite dev`.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Add `globalHeaders` to `staticwebapp.config.json` with the `Content-Security-Policy` from the spec ("Privacy and security"), plus `X-Content-Type-Options: nosniff` and `Referrer-Policy: same-origin`. Implement `swaHeadersPlugin` (`configurePreviewServer`) and the preview hook in `lvgApiPlugin`. Add `operaton.open-regels.nl` to `FORBIDDEN` in `check-bundle.mjs` and update its header comment: the old page left the bundle in Task 17.
- [ ] **Step 4:** Run `npm test`, `npm run build`, `npm run check-bundle`. Expected: PASS.
- [ ] **Step 5:** Owner check: `npm run build && npm run preview`, open `http://localhost:4173/nl/wonen`, open the browser console. Expected: the not-yet-built page renders, the stand-in frame shows, no CSP errors.
- [ ] **Step 6:** After owner go-ahead, commit `feat: enforce a strict CSP and serve the API in vite preview`.

### Task 20: Playwright walkthroughs in CI

**Files:**

- Create: `playwright.config.ts`, `e2e/support.ts`, `e2e/frame.spec.ts`
- Modify: `package.json` (scripts), `vite.config.js` (exclude `e2e/**` from Vitest), `.github/workflows/azure-lvg-acc.yml`, `.github/workflows/azure-lvg-stable.yml`, `SECURITY-PIPELINE.md`, `.gitignore` (`test-results/`, `playwright-report/`)

**Interfaces:**

- Produces: `test` fixture in `e2e/support.ts` that fails a test on any console message containing `Content Security Policy`, and `expectAccessible(page)` with `@axe-core/playwright` (tags `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`).

- [ ] **Step 1:** Install dev dependencies `@playwright/test` and `@axe-core/playwright`. Root script `test:e2e`: `npm run build && playwright test`. `playwright.config.ts`: Chromium only, `webServer` `npm run preview -- --port 4173 --strictPort` with `LVG_SCENARIOS=on`, `baseURL` `http://localhost:4173`, viewports 1440×900 and 375×812 as two projects.
- [ ] **Step 2:** `e2e/frame.spec.ts`: `/nl/wonen` shows the band and the H1, passes axe, and logs no CSP violation; `?kader=uit` hides the band.
- [ ] **Step 3:** Both workflows: after `Run API tests` (Node 22 is active, the API is installed), add `npx playwright install --with-deps chromium` and `npx playwright test` (not `npm run test:e2e`: it would rebuild `dist/` without the workflow's build variables, and that `dist/` is what gets deployed) with `OPERATON_BASE_URL=https://operaton.open-regels.nl/engine-rest` and `LVG_SCENARIOS=on`; upload `playwright-report/` as an artifact on failure. Pin the upload action by commit SHA, as the other actions are.
- [ ] **Step 4:** `SECURITY-PIPELINE.md`: Playwright downloads its browser from the Playwright CDN in CI; the version follows the lockfile.
- [ ] **Step 5:** The owner runs `npm run test:e2e` once locally with local Operaton running. Expected: 2 tests × 2 viewports pass. The builder does not run Playwright (CLAUDE.md, no browser automation).
- [ ] **Step 6:** After owner go-ahead, commit `test: add Playwright walkthroughs with axe and CSP checks`.

### Task 21: Wonen and Koopwoningen

**Files:**

- Create: `src/pages/WonenPage.tsx`, `src/pages/KoopwoningenPage.tsx`, `src/features/` sections they need, with `.test.tsx` per page; `e2e/koopwoningen.spec.ts`

- [ ] **Step 1: Write failing tests** with the contract's examples as loader data: Wonen shows the cards from the response; Koopwoningen with `weergave: 'lijst'` lists three links showing `adresMetPlaats`, the label tile and `[soort], [bouwjaar]`; with `direct` it navigates to the property with `replace: true`; with `leeg` it shows `U heeft geen koopwoning op uw naam staan.`; no axe violations. `e2e/koopwoningen.spec.ts`: per scenario, the expected page, Back after the `een-woning` redirect does not return to the list, axe passes.
- [ ] **Step 2–4:** Run `npm test` (FAIL), implement with the copy from spec sections 1 and 2, run `npm test`, `npm run typecheck` (PASS).
- [ ] **Step 5:** After owner go-ahead, commit `feat: add the Wonen and Koopwoningen pages`.

### Task 22: Woning, Kadaster, WOZ and Energielabel

**Files:**

- Create: `src/pages/WoningPage.tsx`, `KadasterPage.tsx`, `WozPage.tsx`, `EnergielabelPage.tsx`, their features, with tests; `e2e/woning.spec.ts`

- [ ] **Step 1: Write failing tests**, per page from the contract's examples: the fields and links of its spec section; a section with `status: 'niet-beschikbaar'` shows `Deze gegevens zijn nu niet beschikbaar.` while others render; the Energielabel page shows the Verduurzamen card only with the `bekijk-dakisolatie` action; placeholder links (`#nog-niet-beschikbaar`) render as links to the "Nog niet beschikbaar" page; no axe violations. `e2e/woning.spec.ts`: from the list to each of the four pages and back by breadcrumb (desktop) and back link (mobile); axe on each.
- [ ] **Step 2–4:** Run (FAIL), implement with the copy from spec sections 3 to 6, run `npm test`, `npm run typecheck` (PASS).
- [ ] **Step 5:** After owner go-ahead, commit `feat: add the property, Kadaster, WOZ and energy label pages`.

### Task 23: Ship Part 2

- [ ] **Step 1:** Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:api`, `npm run lint:contract`, `npm run check-format`, `npm run build`, `npm run check-bundle`. Expected: all pass. The owner runs `npm run test:e2e`. Expected: pass.
- [ ] **Step 2:** Push and ask the owner to open a pull request into `acc`. CI runs the walkthroughs. On the preview, the owner walks through all three scenarios on desktop and at 375 px, with and without `?kader=uit`, compares each page with its Figma export, and checks the console for CSP errors. Differences go into the iteration log in `docs/runbook.md`.

---

## Part 3: Roof insulation and consent

Branch: `feat/dakisolatie` from `acc`.

### Task 24: Dakisolatie page

**Files:**

- Create: `src/pages/DakisolatiePage.tsx`, its features, `src/pages/DakisolatiePage.test.tsx`, `e2e/dakisolatie.spec.ts`

- [ ] **Step 1: Write failing tests** from the contract's examples: the recommended option is highlighted (`LuxAlert` type `success`) with its six values; the other options appear in a table with a caption; the assumptions accordion lists what the API sends; with the `niet-beschikbaar` example the advice card shows the `melding`'s `burgerActie` and the button `Offerte aanvragen bij een aannemer` is absent; when no option is `aanbevolen`, there is no highlighted box and the table shows all four; no axe violations. `e2e/dakisolatie.spec.ts`: from Energielabel to Dakisolatie with the real API; the advice is shown; a second test intercepts `/api/v1/woningen/*/dakisolatie` with the contract's `niet-beschikbaar` example and checks the message and the missing button; axe on both.
- [ ] **Step 2–4:** Run (FAIL), implement with the copy from spec section 7, run `npm test`, `npm run typecheck` (PASS).
- [ ] **Step 5:** After owner go-ahead, commit `feat: add the roof insulation advice page`.

### Task 25: Consent steps

**Files:**

- Create: `src/pages/AannemerKiezenPage.tsx`, `src/pages/ToestemmingPage.tsx`, `src/pages/ToestemmingGegevenPage.tsx`, their features, with tests; `e2e/toestemming.spec.ts`

- [ ] **Step 1: Write failing tests:** submitting 8a without a choice shows `Kies een aannemer.` at the field and focuses it; 8b shows each set with its source and either `Verplicht — staat vast` or a switch; `Toestemming geven` is disabled until the box is ticked and has an `aria-describedby` text; submitting posts the chosen contractor, the switched-on sets and the duration through a router `action`, then navigates to 8c with the kenmerk; a 400 from the API shows its `burgerActie` on the form; `Weigeren` returns to Dakisolatie with `U heeft geen gegevens gedeeld.`; 8c shows the four values; no axe violations. `e2e/toestemming.spec.ts`: the whole flow with the real API, by keyboard only, ending on 8c with a `TS-` reference; axe on each step.
- [ ] **Step 2–4:** Run (FAIL), implement with the copy from spec section 8, run `npm test`, `npm run typecheck` (PASS). The chosen contractor travels from 8a to 8b as a search parameter holding the contractor id only.
- [ ] **Step 5:** After owner go-ahead, commit `feat: add the contractor choice and consent steps`.

### Task 26: Remove the old page

**Files:**

- Delete: `src/components/PageHeader.jsx`, `PublicInfoSection.jsx`, `PersonalInfoSection.jsx`, `LoginPrompt.jsx`, `RoofInsulationModal.jsx`, `DataStatus.jsx`; `src/hooks/`; `src/services/`; `src/lib/latestRequest.js` and its test
- Modify: `README.md` (stack, structure, local setup with `api/` and Playwright), `CLAUDE.md` (repository map), `docs/runbook.md` if anything changed, `tsconfig.json` (no `.jsx` left)

- [ ] **Step 1:** Delete. Run `git ls-files 'src/**/*.js' 'src/**/*.jsx'` and expect nothing; `git grep -n "lucide\|tailwind" -- src` returns nothing.
- [ ] **Step 2:** Run all checks from Task 23, Step 1. Expected: pass.
- [ ] **Step 3:** After owner go-ahead, commit `refactor: remove the single-page dashboard`.

### Task 27: Ship Part 3

- [ ] **Step 1:** Push and ask the owner to open a pull request into `acc`. CI runs the walkthroughs. The owner completes Woning → Energielabel → Dakisolatie → aannemer → toestemming → gegeven against local Operaton and then on the preview, desktop and mobile, once by keyboard only, with a screen reader on the consent step.
- [ ] **Step 2:** Record the iteration in `docs/runbook.md` (what was built, what differs from the designs, open questions answered), and add to issue #37 what iteration 2 already aligned. After merge, promote to `main` when the owner says so.
