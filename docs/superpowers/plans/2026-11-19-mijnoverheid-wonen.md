# MijnOverheid Wonen Implementation Plan, iteration 1

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MijnOverheid Wonen content pages on NL Design System components, backed by a thin LVG API, with roof insulation advice from Operaton and a mocked consent step working from start to finish.

**Architecture:** Part 1 adds the LVG API in `api/`: OpenAPI contract first, plain core handlers, mock sources, the Operaton call moved from the browser, Azure Functions adapters, a Vite plugin for local development, and CI. Part 2 replaces the single page with a React Router app on Rijkshuisstijl Community components: shared components, the stand-in frame and the six designed pages. Part 3 adds Dakisolatie and the consent steps and removes the old code.

**Tech Stack:** React 18, React Router 7, Rijkshuisstijl Community components and tokens, Vite 8, Vitest 5 (Node for the API, jsdom for pages), Testing Library, axe, Azure Functions v4 on Node 22 as SWA managed functions, Spectral with the ADR ruleset, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-19-mijnoverheid-wonen-ux-design.md`

**Runbook:** `docs/runbook.md` describes the iteration loop this plan is the first instance of.

## Global Constraints

- **Commits:** ask the owner before every `git commit`. Stage, report, stop. One message may approve several named commits.
- **Merges:** the owner merges every pull request. Never push to `acc` or `main`.
- **Attribution:** no Claude attribution anywhere.
- **Gates:** never `--no-verify`, `HUSKY=0` or `SKIP=`. A failing hook is reported, not bypassed.
- **Dev server and installs:** never start or stop the dev server, and never run `npm ci`. The owner stops the server before dependency changes and runs `npm ci` (root and `api/`) when asked. New dependencies are added with `npm install`, which respects the 14-day cooldown in `.npmrc`; a version npm refuses under the cooldown is not forced.
- **Browser checks:** no browser automation. The owner checks the UI.
- **Branches:** each part branches from an up-to-date `acc`, in the main checkout, with no worktree.
- **Naming:** `main` is the "stable release", never "production".
- **Language:** code, comments and docs in English. Interface copy in Dutch, exactly as in the spec.
- **Business rules:** none in `src/`. Cost figures, target values, thresholds, status rules and allowed actions live in `api/`. `src/lib/format.js` only formats with `Intl`.
- **Operaton:** called only from `api/`. `OPERATON_BASE_URL` is `https://operaton.open-regels.nl/engine-rest` on Azure. `localhost:8081`, `demo:demo` and any Operaton URL never appear in `dist/`.
- **Privacy:** no address, BSN or other personal data in URLs, logs or browser storage. Woning ids are opaque.
- **API runtime:** everything in `api/` must run on Node 22; the front-end toolchain stays on the Node in `.nvmrc`.
- **Tests:** Vitest, importing from `vitest` explicitly. API tests run in Node; page tests use `// @vitest-environment jsdom` per file.

## Review Focus

1. **Business logic creeping into `src/`:** any arithmetic, comparison or constant that changes meaning. Search `src/` for numbers other than layout values in review.
2. **Single property redirect:** must replace history, or Back loops. Covered in Task 14.
3. **Consent button:** disabled until the box is ticked, and explained to screen readers. Covered in Task 18.
4. **Operaton down:** Dakisolatie must show the API's `burgerActie` and hide the action button, not crash. Covered in Tasks 6 and 17.
5. **Scenario header in production:** ignored unless `LVG_SCENARIOS=on`. Covered in Task 3.
6. **Frame independence:** content pages must not import from `src/frame/`. Covered by a lint rule in Task 11.
7. **DMN patch:** existing outputs must not change, and the API must not invent a recommendation when the DMN gives none. Covered in Tasks 5 and 6.

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
- [ ] **Step 2:** Owner: create the branch, `git rm -r "docs/Mock-up"`, check `git grep -n "Mock-up" -- ':!docs/'` returns nothing, and stage the rest.
- [ ] **Step 3:** Owner: commit `docs: add MijnOverheid Wonen design, plan, runbook and CLAUDE.md` and `docs: remove superseded Mijn Woning mock-ups`.
- [ ] **Step 4:** Owner: push and open a pull request into `acc`. `CLAUDE.md` is not under `docs/` but ends in `.md`, so the deploy workflow still skips the build by design.
- [ ] **Step 5:** After merge, the implementation session starts at Task 1.

---

## Part 1: LVG API

Branch: `feat/lvg-api` from `acc`.

### Task 1: API package and contract skeleton

**Files:**

- Create: `api/package.json`, `api/package-lock.json`, `api/host.json`, `api/.funcignore`, `api/openapi.yaml`, `api/.spectral.yaml`, `api/vitest.config.js`
- Modify: `.gitignore`, `.prettierignore` if needed, `eslint.config.mjs` (Node globals for `api/**`)

- [ ] **Step 1:** Ask the owner to stop the dev server. In `api/`, create `package.json` (`"type": "module"`, `"engines": { "node": ">=22" }`, `"main": "src/functions/*.js"`) with scripts `test` (`vitest run`) and `lint:contract` (`spectral lint openapi.yaml`). Install `@azure/functions`, `yaml` and, as dev dependencies, `vitest`, `@stoplight/spectral-cli`, `ajv`, `ajv-formats`.
- [ ] **Step 2:** `host.json` with version 2.0 and the extension bundle `[4.*, 5.0.0)`. `.funcignore` excludes tests and `openapi.yaml` is kept.
- [ ] **Step 3:** Ask the owner to download `https://static.developer.overheid.nl/adr/ruleset.yaml` to `api/.spectral.yaml` and to add a first comment line with the source URL and download date. Vendored so CI does not fetch rules from the network at lint time.
- [ ] **Step 4:** Write `api/openapi.yaml` (OAS 3.0.3): `info` with title `LVG Wonen API`, `version: 1.0.0`, contact; server `/api/v1`; the endpoints in the spec's table with request and response schemas; `Accept-Language` parameter (enum `[nl]`, default `nl`) on every operation; `Content-Language` and `API-Version` response headers; responses 200/201, 400, 404, 406, 500, 503 with `application/problem+json` and the extra `burgerActie` property. Schema names in Dutch, matching the spec's example.
- [ ] **Step 5:** Run `npm run lint:contract --prefix api`. Expected: no errors. Fix the contract, not the ruleset.
- [ ] **Step 6:** After owner go-ahead, commit `feat(api): add API package and OpenAPI contract`.

### Task 2: Core request handling

**Files:**

- Create: `api/src/core/http.js`, `api/src/core/http.test.js`, `api/src/core/router.js`, `api/src/core/router.test.js`, `api/src/core/contract.js`, `api/test/contract.js`

**Interfaces:**

- Produces: `handle(request: { method, path, headers, body }) → Promise<{ status, headers, body }>`; `problem(status, title, detail, burgerActie)`; `contract.js` exports the parsed contract for `/api/v1/openapi.json`; `test/contract.js` exports `expectValidResponse(operationId, response)` using ajv on the contract's schemas.

- [ ] **Step 1: Write failing tests:** unknown path gives 404 problem+json with `burgerActie`; `Accept-Language: en` gives 406; every response has `Content-Language: nl` and `API-Version: 1.0.0`; `GET /api/v1/openapi.json` returns the contract as JSON.
- [ ] **Step 2:** Run `npm test --prefix api`. Expected: FAIL.
- [ ] **Step 3:** Implement `http.js` and `router.js`: a small table of `{ method, pattern, operationId, handler }`, path parameters, header handling, and a catch-all that turns thrown errors into a 500 problem with `burgerActie: 'Probeer het later opnieuw.'`, logging the error without request data.
- [ ] **Step 4:** Run tests. Expected: PASS.
- [ ] **Step 5:** After owner go-ahead, commit `feat(api): add core request handling`.

### Task 3: Mock sources and scenarios

**Files:**

- Create: `api/src/mock/scenarios.js`, `api/src/sources/registers.js`, `api/src/sources/registers.test.js`, `api/src/core/scenario.js`, `api/src/core/scenario.test.js`
- Source for data: `src/services/mockPropertyData.js` (Rotterdam property and building data, contractors)

**Interfaces:**

- Produces: `resolveScenario(headers, env) → 'geen-woning' | 'een-woning' | 'drie-woningen'`; `registers.listWoningen(scenario)`, `getWoning(scenario, id)`, `getKadaster`, `getWoz`, `getEnergielabel`, `getDak`, `getAannemers`. All async; unknown id rejects with a not-found error.

- [ ] **Step 1: Write failing tests:** the header is honoured only when `env.LVG_SCENARIOS === 'on'`; without it the scenario is `drie-woningen`; unknown scenario names fall back to `drie-woningen`; `een-woning` lists one property; `geen-woning` lists none; ids are opaque (no digits of a postcode or house number); returned objects are copies.
- [ ] **Step 2:** Run tests. Expected: FAIL.
- [ ] **Step 3:** Implement. The Rotterdam property gets id `w-7f3a`, the design's other two get `w-2c91` (Straatnaam 23, Drechtstad, label A, 1994) and `w-b04e` (Regenboogweg 9, Nintendorp, label C, 1967). The rental property from the design is not mocked: rental is out of scope. Give the Rotterdam property's building data a roof area, `dak.oppervlakte_m2`, separate from `gebouw.vloeroppervlakte_m2`; use 120 so today's results stay comparable. Fill the Kadaster, WOZ and energy label fields with the values shown in the designs; the photos use `public/perceel-1560.png` and a placeholder.
- [ ] **Step 4:** Run tests. Expected: PASS.
- [ ] **Step 5:** After owner go-ahead, commit `feat(api): add mock registers and scenarios`.

### Task 4: Register resources

**Files:**

- Create: `api/src/resources/wonen.js`, `woningen.js`, `kadaster.js`, `woz.js`, `energielabel.js`, each with a test

**Interfaces:**

- Consumes: Tasks 2 and 3.
- Produces: handlers for `getWonen`, `listWoningen`, `getWoning`, `getKadaster`, `getWoz`, `getEnergielabel`, registered in the router.

- [ ] **Step 1: Write failing tests**, one file per resource. Each asserts the fields the spec names for its page and calls `expectValidResponse`. Specifically: `listWoningen` returns `weergave` `direct`, `lijst` or `leeg` per scenario; `getWoning` returns four sections each with `status`; `getEnergielabel` returns `objectAanduiding`, a `geldigheid` status (`geldig` or `verlopen`, decided in the API from the dates), and the action `bekijk-dakisolatie` only for a property with building data.
- [ ] **Step 2:** Run tests. Expected: FAIL.
- [ ] **Step 3:** Implement. Dates go out as ISO dates; amounts as numbers in euros; texts for info buttons as plain Dutch strings.
- [ ] **Step 4:** Run tests. Expected: PASS.
- [ ] **Step 5:** After owner go-ahead, commit `feat(api): add register resources`.

### Task 5: Bring the DMN into the repository and add `aanbevolen`

**Files:**

- Create: `dmn/bereken_isolatie_opties.dmn`, `dmn/README.md`, `scripts/deploy-dmn-local.sh`

- [ ] **Step 1:** Ask the owner to save the deployed source:
      `curl -s https://operaton.open-regels.nl/engine-rest/decision-definition/key/bereken_isolatie_opties/xml`
      returns JSON with `dmnXml`. Write that string, unescaped, to `dmn/bereken_isolatie_opties.dmn`.
      Commit it unchanged first, so the patch is a reviewable diff. Note the deployed version
      and id in `dmn/README.md`.
- [ ] **Step 2:** After owner go-ahead, commit `chore(dmn): add bereken_isolatie_opties as deployed (version 21)`.
- [ ] **Step 3:** Add an output column `aanbevolen` (label `Aanbevolen`, `typeRef="boolean"`) to the
      decision table. Every rule gets a value: `true` for the rule with the recommendation text
      (target R 6.0), `false` for the others. Do not change the decision key, inputs or other
      outputs. Keep FEEL as Operaton accepts it (for example `not(x)`, not `not x`).
- [ ] **Step 4:** `scripts/deploy-dmn-local.sh` posts the file to
      `http://localhost:8081/engine-rest/deployment/create` as multipart form data
      (`deployment-name=lvg-dmn`, `deploy-changed-only=true`, the file) with the local login from
      `OPERATON_USER` / `OPERATON_PASSWORD` (default `demo`). It refuses any other host.
- [ ] **Step 5:** Owner check: run the script against local Operaton, then evaluate the decision for
      target 6.0 and 4.0 with the inputs from `src/services/insulationParams.js`. Expected:
      `aanbevolen` is `true` for 6.0 and `false` for 4.0; all other outputs are unchanged from
      the call before the patch.
- [ ] **Step 6:** `dmn/README.md` describes the decision, its inputs and outputs, the deploy script,
      and that `operaton.open-regels.nl` still runs version 21 without `aanbevolen` until the
      owner deploys it there.
- [ ] **Step 7:** After owner go-ahead, commit `feat(dmn): add the aanbevolen output`.

### Task 6: Operaton and the Dakisolatie resource

**Files:**

- Create: `api/src/operaton/client.js`, `api/src/operaton/client.test.js`, `api/src/operaton/parameters.js`, `api/src/resources/dakisolatie.js`, `api/src/resources/dakisolatie.test.js`
- Source to move: `src/services/operatonService.js`, `src/services/operatonService.test.js`, `src/services/insulationParams.js` (deleted in Task 19)

**Interfaces:**

- Produces: `evaluateIsolatie(params, { baseUrl, user, password, fetch })`; `buildIsolatieParams(dak)`; `TARGET_R_VALUES`; handler `getDakisolatie`.

- [ ] **Step 1:** Move the existing Operaton tests to `client.test.js`, adapted: the URL is built from `baseUrl`; with `user` and `password` set the request has a Basic `Authorization` header, without them it has none; payload and types are unchanged; a non-OK response throws.
- [ ] **Step 2: Write failing tests** for `getDakisolatie`: four options; `aanbevolen` taken from the DMN output per option, and all `false` when the DMN result has no `aanbevolen` output (version 21), with no fallback rule in the API; the roof area sent to Operaton is `dak.oppervlakte_m2`, not floor area; `kostenPerM2Eur` rounded to whole euros; amounts rounded to whole euros and payback to one decimal; `uitgangspunten` lists λ, material price and labour price; actions `deel-met-aannemer` and `meer-over-subsidie`. With `fetch` rejecting: status 200, `advies.status: 'niet-beschikbaar'`, a `burgerActie`, and no `deel-met-aannemer` action. Each case calls `expectValidResponse`.
- [ ] **Step 3:** Run tests. Expected: FAIL.
- [ ] **Step 4:** Implement. Configuration comes from `process.env.OPERATON_BASE_URL`, `OPERATON_USER`, `OPERATON_PASSWORD`. A timeout of 10 seconds per call. The four calls run in parallel, as today.
- [ ] **Step 5:** Run tests. Expected: PASS.
- [ ] **Step 6:** After owner go-ahead, commit `feat(api): move the roof insulation decision to the API`.

### Task 7: Contractors and consent

**Files:**

- Create: `api/src/resources/aannemers.js`, `api/src/resources/toestemmingen.js`, both with tests

**Interfaces:**

- Produces: `getAannemers`, `createToestemming`, `getToestemming`.

- [ ] **Step 1: Write failing tests:** contractors come without ratings; each response lists the four data sets from the spec with `verplicht` and default `aan`, and durations 7, 14, 30 with default 14; `createToestemming` rejects a missing contractor (400, `burgerActie: 'Kies een aannemer.'`) and an attempt to switch off a required set (400); on success it returns 201 with a kenmerk `TS-YYYY-MMDD-NNNN`, `geldigTot` computed by the API, and a `Location` header; `getToestemming` returns it; an unknown kenmerk gives 404.
- [ ] **Step 2:** Run tests. Expected: FAIL.
- [ ] **Step 3:** Implement with an in-memory store, cleared when the process restarts.
- [ ] **Step 4:** Run tests. Expected: PASS.
- [ ] **Step 5:** After owner go-ahead, commit `feat(api): add contractors and mocked consent`.

### Task 8: Azure Functions adapters and local development

**Files:**

- Create: `api/src/functions/lvg.js`, `vite/lvgApiPlugin.js`
- Modify: `vite.config.js`, `public/staticwebapp.config.json`, `README.md` (local setup)

- [ ] **Step 1:** In `api/src/functions/lvg.js`, register one HTTP function with route `v1/{*path}`, anonymous auth level, all methods used, that converts the Azure request to the core `request`, calls `handle`, and returns the result.
- [ ] **Step 2:** In `vite/lvgApiPlugin.js`, a dev-only plugin (`apply: 'serve'`) that mounts the same `handle` on `/api/` using Connect middleware. It reads `OPERATON_*` and `LVG_SCENARIOS` from `loadEnv(mode, cwd, ['OPERATON_', 'LVG_'])`, defaults to `http://localhost:8081/engine-rest`, `demo`/`demo` and `LVG_SCENARIOS=on`, and passes them to the core as configuration, never to the client.
- [ ] **Step 3:** In `vite.config.js`, remove the `/api/engine-rest/...` proxy and add the plugin.
- [ ] **Step 4:** In `staticwebapp.config.json`, add `"platform": { "apiRuntime": "node:22" }` and exclude `/api/*` from `navigationFallback`.
- [ ] **Step 5:** Owner check: with local Operaton running, the owner runs `npm ci --prefix api` and `npm run dev`, then opens `http://localhost:5173/api/v1/woningen/w-7f3a/dakisolatie`. Expected: JSON with four options.
- [ ] **Step 6:** After owner go-ahead, commit `feat(api): add Azure Functions adapter and local dev plugin`.

### Task 9: CI and hooks

**Files:**

- Modify: `.github/workflows/azure-lvg-acc.yml`, `.github/workflows/azure-lvg-stable.yml`, `.husky/pre-push`, `package.json` (scripts), `SECURITY-PIPELINE.md`, `scripts/check-deps.sh` (also check `api/`)

- [ ] **Step 1:** Root scripts: `test:api` (`npm test --prefix api`), `lint:contract` (`npm run lint:contract --prefix api`), `check-bundle` (a script that fails if `dist/` contains `localhost:8081`, `demo:demo` or `operaton.open-regels.nl`).
- [ ] **Step 2:** In both workflows, after the root `npm ci`: `npm ci --prefix api`, `npm run lint:contract`, `npm run test:api`. After the build: `npm run check-bundle`. Before deploy: `npm prune --omit=dev --prefix api`. Deploy with `api_location: 'api'` and `skip_api_build: true`.
- [ ] **Step 3:** The owner sets the app settings `OPERATON_BASE_URL` on both Static Web Apps, and `LVG_SCENARIOS=on` on the acceptance app only (previews inherit it).
- [ ] **Step 4:** Pre-push hook: add `npm run test:api` and `npm run lint:contract` after `npm test`.
- [ ] **Step 5:** `SECURITY-PIPELINE.md`: the API's own lockfile, the vendored ADR ruleset and the bundle check.
- [ ] **Step 6:** After owner go-ahead, commit `ci: build, test and deploy the LVG API`.

### Task 10: Ship Part 1

- [ ] **Step 1:** Push and open a pull request into `acc`. On the preview, the owner opens `/api/v1/openapi.json`, `/api/v1/woningen` and `/api/v1/woningen/w-7f3a/dakisolatie`. Expected: valid JSON, the dakisolatie options calculated by `operaton.open-regels.nl`. The existing page still works.
- [ ] **Step 2:** After the owner merges, promote `acc` to `main` by pull request when the owner says so.

---

## Part 2: Pages on NL Design System

Branch: `feat/wonen-pages` from `acc`.

### Task 11: Stack switch

**Files:**

- Modify: `package.json`, `package-lock.json`, `src/main.jsx`, `src/index.css`, `eslint.config.mjs`, `index.html` (`lang="nl"`)
- Delete: `tailwind.config.js`, `postcss.config.js`

- [ ] **Step 1:** Ask the owner to stop the dev server. Install `react-router@7`, `@rijkshuisstijl-community/components-react`, `@rijkshuisstijl-community/components-css`, `@rijkshuisstijl-community/design-tokens`, `@rijkshuisstijl-community/font`; dev dependencies `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `axe-core`. Uninstall `tailwindcss`, `autoprefixer`, `postcss`, `lucide-react`. Then run `npm ls vega react-vega`: `@utrecht/component-library-react`, a dependency of the components package, declares them as peers. If npm installs them, report the added size to the owner before committing.
- [ ] **Step 2:** `src/index.css` imports the font, the token CSS and the components CSS, and sets the theme class on `body` as the library's README prescribes. Keep only page-level layout CSS.
- [ ] **Step 3:** ESLint: forbid imports from `src/frame/` in `src/pages/**` and `src/components/**` (`no-restricted-imports`).
- [ ] **Step 4:** The old page will look unstyled after this task; that is expected and is replaced in the next tasks of this part. Run `npm run lint` and `npm test`. Expected: pass.
- [ ] **Step 5:** After owner go-ahead, commit `build: switch to NL Design System and React Router`.

### Task 12: API client, router and shared components

**Files:**

- Create: `src/api/client.js`, `src/api/client.test.js`, `src/api/wonen.js`, `src/routes.jsx`, `src/lib/format.js`, `src/lib/format.test.js`, `src/components/` (`ContentCard`, `DataList`, `EnergielabelSchaal`, `ContactCard`, `FaqCard`, `PageTitle`, `LoadState`, `ErrorState`, `ExternalLink`, `DownloadLink`), each presentational component with a jsdom test including axe
- Modify: `src/main.jsx`
- Delete: `src/App.jsx`

**Interfaces:**

- Produces: `apiGet(path)`, `apiPost(path, body)` that send `Accept-Language: nl` and `X-LVG-Scenario` (from `sessionStorage`, default `drie-woningen`) and throw `ApiError { status, title, detail, burgerActie }`; one function per resource in `wonen.js`; `formatEuro`, `formatDatum`, `formatGetal`.

- [ ] **Step 1: Write failing tests** for the client (headers sent; problem+json becomes `ApiError`; a network failure becomes `ApiError` with `burgerActie: 'Controleer uw internetverbinding en probeer het opnieuw.'`) and for `format.js` (`4080` → `€ 4.080`; `'2025-01-01'` → `1 januari 2025`; `2.8` → `2,8`).
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement the client and formatting. Build the components on Rijkshuisstijl Community components where the spec's shared-patterns table names one. `EnergielabelSchaal` renders seven blocks with the class letter in the active block, `aria-hidden` on the blocks and a visually hidden `Energielabel [klasse]`. `PageTitle` renders `BreadcrumbNav` from 768 px and a back link below it, sets `document.title` to `[titel] - MijnOverheid`, and moves focus to the H1 on navigation.
- [ ] **Step 4:** `routes.jsx` with the spec's route table, loaders calling `src/api/wonen.js`, an `errorElement` that renders `ErrorState` or the 404 page, and a basename from `import.meta.env.VITE_BASE_PATH ?? '/'`. `/` redirects to `/nl/wonen`. Pages for Part 3 render "Nog niet beschikbaar" for now.
- [ ] **Step 5:** Run tests and lint. Expected: pass.
- [ ] **Step 6:** After owner go-ahead, commit `feat: add API client, routes and shared components`.

### Task 13: Stand-in frame and scenario switch

**Files:**

- Create: `src/frame/StandInFrame.jsx`, `src/frame/ScenarioSwitch.jsx`, `src/frame/BuildLine.jsx`, `src/frame/frame.css`, `src/frame/StandInFrame.test.jsx`
- Modify: `src/main.jsx`
- Delete: `src/components/Footer.jsx` (its content moves to `BuildLine`)

- [ ] **Step 1: Write failing tests:** the band text `Nagebootst MijnOverheid-kader. Geen onderdeel van de oplevering.` is shown; `?kader=uit` renders only the content; changing the scenario writes `sessionStorage` and revalidates the router; the build line shows `local build` without build variables.
- [ ] **Step 2:** Run tests. Expected: FAIL.
- [ ] **Step 3:** Implement as described in the spec. Side menu and header items other than Wonen are inert text, not links.
- [ ] **Step 4:** Run tests. Expected: PASS.
- [ ] **Step 5:** After owner go-ahead, commit `feat: add stand-in MijnOverheid frame and scenario switch`.

### Task 14: Wonen and Koopwoningen

**Files:**

- Create: `src/pages/WonenPage.jsx`, `src/pages/KoopwoningenPage.jsx`, `src/pages/NietBeschikbaarPage.jsx`, `src/pages/NietGevondenPage.jsx`, with tests

- [ ] **Step 1: Write failing tests** with fixtures that pass `expectValidResponse`-shaped data: Wonen shows the cards from the response; Koopwoningen with `weergave: 'lijst'` lists three links; with `direct` it navigates to the property with `replace: true`; with `leeg` it shows the empty message; no axe violations.
- [ ] **Step 2–4:** Run (FAIL), implement with the copy from spec sections 1 and 2, run (PASS).
- [ ] **Step 5:** After owner go-ahead, commit `feat: add Wonen and Koopwoningen pages`.

### Task 15: Woning, Kadaster, WOZ and Energielabel

**Files:**

- Create: `src/pages/WoningPage.jsx`, `KadasterPage.jsx`, `WozPage.jsx`, `EnergielabelPage.jsx`, with tests

- [ ] **Step 1: Write failing tests**, per page: the fields and links of its spec section; a section with `status: 'niet-beschikbaar'` shows `Deze gegevens zijn nu niet beschikbaar.` while others render; the Energielabel page shows the Verduurzamen card only with the `bekijk-dakisolatie` action; no axe violations.
- [ ] **Step 2–4:** Run (FAIL), implement with the copy from spec sections 3 to 6, run (PASS).
- [ ] **Step 5:** After owner go-ahead, commit `feat: add property, Kadaster, WOZ and energy label pages`.

### Task 16: Ship Part 2

- [ ] **Step 1:** `npm test`, `npm run test:api`, `npm run lint`, `npm run check-format`, `npm run build`, `npm run check-bundle`. Expected: all pass.
- [ ] **Step 2:** Push and open a pull request into `acc`. On the preview, the owner walks through all three scenarios on desktop and at 375 px width, with and without `?kader=uit`, and compares each page to its Figma export. Differences go into the iteration log in `docs/runbook.md`.

---

## Part 3: Roof insulation and consent

Branch: `feat/dakisolatie` from `acc`.

### Task 17: Dakisolatie page

**Files:**

- Create: `src/pages/DakisolatiePage.jsx`, `src/pages/DakisolatiePage.test.jsx`

- [ ] **Step 1: Write failing tests:** the recommended option is highlighted with its six values; the other options appear in a table with a caption; the assumptions accordion lists what the API sends; with `advies.status: 'niet-beschikbaar'` the advice card shows `burgerActie` and the button `Offerte aanvragen bij een aannemer` is absent; no axe violations.
- [ ] **Step 2–4:** Run (FAIL), implement with the copy from spec section 7, run (PASS). Reuse texts from `RoofInsulationModal.jsx` only where the spec says so.
- [ ] **Step 5:** After owner go-ahead, commit `feat: add roof insulation advice page`.

### Task 18: Consent steps

**Files:**

- Create: `src/pages/AannemerKiezenPage.jsx`, `src/pages/ToestemmingPage.jsx`, `src/pages/ToestemmingGegevenPage.jsx`, with tests

- [ ] **Step 1: Write failing tests:** submitting 8a without a choice shows `Kies een aannemer.` and focuses the field; 8b shows each set with its source and either `Verplicht — staat vast` or a switch; `Toestemming geven` is disabled until the box is ticked and has an `aria-describedby` text; submitting posts the chosen contractor, the switched-on sets and the duration, then navigates to 8c with the kenmerk; `Weigeren` returns to Dakisolatie with `U heeft geen gegevens gedeeld.`; 8c shows the four values; no axe violations.
- [ ] **Step 2–4:** Run (FAIL), implement with the copy from spec section 8 using a React Router `action` for the post, run (PASS). The chosen contractor travels from 8a to 8b as router state or a search parameter holding the contractor id only.
- [ ] **Step 5:** After owner go-ahead, commit `feat: add contractor choice and consent steps`.

### Task 19: Remove the old page

**Files:**

- Delete: `src/components/PageHeader.jsx`, `PublicInfoSection.jsx`, `PersonalInfoSection.jsx`, `LoginPrompt.jsx`, `RoofInsulationModal.jsx`, `DataStatus.jsx`; `src/hooks/`; `src/services/`; `src/lib/latestRequest.js` and its test if unused
- Modify: `README.md` (stack, structure, local setup with `api/`), `docs/runbook.md` if anything changed

- [ ] **Step 1:** Delete. Run `git grep -n "services/\|hooks/\|lucide\|tailwind" -- src` and expect nothing.
- [ ] **Step 2:** Run all checks from Task 16, Step 1. Expected: pass.
- [ ] **Step 3:** After owner go-ahead, commit `refactor: remove the single-page dashboard`.

### Task 20: Ship Part 3

- [ ] **Step 1:** Push and open a pull request into `acc`. The owner completes Woning → Energielabel → Dakisolatie → aannemer → toestemming → gegeven against local Operaton and then on the preview, desktop and mobile, by keyboard only once.
- [ ] **Step 2:** Record the iteration in `docs/runbook.md` (what was built, what differs from the designs, open questions answered). After merge, promote to `main` when the owner says so.
