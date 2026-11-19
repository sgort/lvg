# LVG Frontend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare the LVG frontend for its redesign with service boundaries, a build footer, tests and a README, without changing how the current page looks or behaves.

**Architecture:** Part 1 adds Vitest, a build footer ported from RBA's public site, CI wiring and `README.md`. Part 2 moves hardcoded data and the mock login behind async services, adds three hooks, and reduces `src/App.jsx` to a page composed of large sections moved as they are.

**Tech Stack:** React 18, Vite 8, Tailwind 3, Vitest 5 (Node environment), GitHub Actions, Azure Static Web Apps.

**Spec:** `docs/superpowers/specs/2026-11-18-frontend-foundation-design.md`

## Global Constraints

- **Commits:** ask the owner before every `git commit`. Stage, report, stop. One message may approve several named commits.
- **Merges:** the owner merges every pull request. Never push to `acc` or `main`.
- **Attribution:** no Claude attribution anywhere.
- **Gates:** never `--no-verify`, `HUSKY=0` or `SKIP=`. A failing hook is reported, not bypassed.
- **Dev server and installs:** never start or stop the dev server, and never run `npm ci`. The owner stops the server before dependency changes and runs `npm ci` when asked.
- **Browser checks:** no browser automation. The owner checks the UI.
- **Branches:** each part branches from an up-to-date `acc`, in the main checkout, with no worktree.
- **Naming:** `main` is the "stable release", never "production".
- **Behaviour:** the page keeps its text, styling, order and interaction, apart from the footer and the loading and error states in the spec's table.
- **Operaton:** deployed builds call `https://operaton.open-regels.nl/engine-rest`. No `Authorization` header. `localhost:8081` and `demo:demo` never appear in `dist/`.
- **Tests:** Vitest in Node, importing from `vitest` explicitly. No jsdom, Testing Library or component tests.
- **Footer copy:** `<host> · build <shortSha> · #<run>`, or `<host> · local build`. No version.
- **Site URLs:** `https://acc.lvg.open-regels.nl` for acceptance, `https://lvg.open-regels.nl` for the stable release and as the fallback.

## Review Focus

1. **Logout while personal data is still loading:** the response must not appear after logout. Covered by the `createLatestRequest` tests in Task 7.
2. **Opening the modal before building data has loaded:** the modal must show its message, not crash on `buildingData.gebouw`. Checked by the owner in Task 10.
3. **Reopening the modal after a calculation:** consent, contractor and results must be reset, as today. Checked by the owner in Task 10.
4. **Half-configured build values:** a SHA without a run, or the reverse, must show `local build`. Covered by Task 1's ported tests.
5. **Personal data before login:** services must refuse it without a session. Covered by Task 6's tests.

---

## Part 1: README, build footer and tests

### Task 0: Publish the design and plan

- [ ] **Step 1:** On `docs/frontend-foundation-design`, which already holds the design commit `a550cc0`, stage this plan. After owner go-ahead, commit `docs: add frontend foundation plan`.
- [ ] **Step 2:** Push the branch and open a pull request into `acc`. After the owner merges it, do the housekeeping.

### Task 1: Vitest and build information

Branch: `feat/build-footer` from `acc`.

**Files:**

- Modify: `package.json`, `package-lock.json`
- Create: `src/lib/buildInfo.js`, `src/lib/buildInfo.test.js`

**Interfaces:**

- Produces: `getBuildInfo(): { sha: string, shortSha: string, run: string, isTracked: boolean, label: string }`, and the `test` script `vitest run`.

- [ ] **Step 1:** Ask the owner to stop the dev server. Then install `vitest@^5.0.4` as a dev dependency, matching `ttl-editor`. Set the `test` script to `vitest run`.
- [ ] **Step 2:** Port `../ronl-business-api/packages/public-site/src/lib/buildInfo.test.ts` to `src/lib/buildInfo.test.js`, keeping all eight tests and the `afterEach(vi.unstubAllEnvs)`. Remove type syntax only.
- [ ] **Step 3:** Run `npm test`. Expected: FAIL, because `./buildInfo` cannot be resolved.
- [ ] **Step 4:** Port `buildInfo.ts` to `src/lib/buildInfo.js`, with the JSDoc shape instead of the interface. It reads both values inside the function and `trim()`s them. The untracked label is `local build`. Update the comment to name LVG's workflows.
- [ ] **Step 5:** Run `npm test`, then `npm run lint`. Expected: 8 tests pass, and lint exits 0.
- [ ] **Step 6:** After owner go-ahead, commit `test: add Vitest and build information`.

### Task 2: Footer

**Files:**

- Create: `src/lib/siteInfo.js`, `src/lib/siteInfo.test.js`, `src/components/Footer.jsx`
- Modify: `src/App.jsx`

**Interfaces:**

- Consumes: `getBuildInfo()` from Task 1.
- Produces: `getSiteUrl(): string`, `getSiteHost(url: string): string` and the default export `Footer`.

- [ ] **Step 1: Write the failing tests** in `src/lib/siteInfo.test.js`:

```js
it('uses VITE_SITE_URL when set', () => {
  vi.stubEnv('VITE_SITE_URL', 'https://acc.lvg.open-regels.nl');
  expect(getSiteUrl()).toBe('https://acc.lvg.open-regels.nl');
});
it('falls back to the stable release when unset or blank', () => {
  vi.stubEnv('VITE_SITE_URL', '  ');
  expect(getSiteUrl()).toBe('https://lvg.open-regels.nl');
});
it('reduces a URL to its host', () => {
  expect(getSiteHost('https://acc.lvg.open-regels.nl/')).toBe('acc.lvg.open-regels.nl');
});
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL, because `siteInfo` is missing.
- [ ] **Step 3:** Implement both functions in `src/lib/siteInfo.js`. Read the env inside `getSiteUrl()`.
- [ ] **Step 4:** Create `Footer.jsx`, rendering one line `<a href={siteUrl}>{host}</a> · <span title={sha || undefined}>{label}</span>`. Use small monospace grey text, like RBA's footer. In `App.jsx`, render `<Footer />` after the main content inside the page container, so it shows logged in or not and stays outside the modal.
- [ ] **Step 5:** Run `npm test`, `npm run lint`, `npm run check-format` and `npm run build`. Expected: all pass.
- [ ] **Step 6:** After owner go-ahead, commit `feat: add a footer with build information`.

### Task 3: CI and hook wiring

**Files:**

- Modify: `.github/workflows/azure-lvg-acc.yml`, `.github/workflows/azure-lvg-stable.yml`, `.husky/pre-push`, `SECURITY-PIPELINE.md`

- [ ] **Step 1:** In both LVG workflows, add a `Run tests` step with `npm test`, between lint and build. Give the build step this `env:` block, with `VITE_SITE_URL` set per workflow from Global Constraints:

```yaml
env:
  VITE_BUILD_SHA: ${{ github.sha }}
  VITE_BUILD_RUN: ${{ github.run_number }}
  VITE_SITE_URL: https://acc.lvg.open-regels.nl
```

- [ ] **Step 2:** Add `npm test` to `.husky/pre-push` after `npm run lint`.
- [ ] **Step 3:** In `SECURITY-PIPELINE.md`, make `Build and deploy ACC` cover "Lint, tests and the production build", and remove "a test suite" from the omissions.
- [ ] **Step 4:** Build both ways and check:
  - Run `VITE_BUILD_SHA=570fd98a1c4e2b7d3f8a9016c5d4e2b7a3f81c40 VITE_BUILD_RUN=412 npm run build`, then `grep -rl 570fd98a1c4e2b7d3f8a9016c5d4e2b7a3f81c40 dist`. Expected: one or more files.
  - Run plain `npm run build` and grep `dist` for `local build`. Expected: found, and the SHA is not.
- [ ] **Step 5:** Run `zizmor` (`uvx zizmor@1.29.0 --offline .`), `npm run check-supply-chain` and `npm run check-format`. Expected: no findings, and all exit 0.
- [ ] **Step 6:** After owner go-ahead, commit `ci: run tests and inject build information`.

### Task 4: README

**Files:**

- Create: `README.md`

- [ ] **Step 1:** Write the README with the sections the spec lists: purpose and sandbox status; the three sites; stack; prerequisites, with Node from `.nvmrc`; local setup with `npm ci`, `npm run dev` and `deps:check`; local Operaton on `localhost:8081` with `bereken_isolatie_opties`, the `demo` default and `OPERATON_USER` and `OPERATON_PASSWORD` in `.env.local`; scripts; the branch and pull-request flow with deployments; `SECURITY-PIPELINE.md`; and the EUPL 1.2 licence. Don't link to the documentation site.
- [ ] **Step 2:** Run `npm run check-format`. Expected: passes.
- [ ] **Step 3:** After owner go-ahead, commit `docs: add README`.

### Task 5: Ship Part 1

- [ ] **Step 1:** Ask the owner to run `npm ci` if `deps:check` reports a stale install, and to check `local build` on `localhost:5173`. Push, and open the pull request into `acc`.
- [ ] **Step 2:** On the preview, confirm by fetching `/assets/index-*.js`: it contains the run's full SHA and run number, and `acc.lvg.open-regels.nl`. Note that a preview SHA is GitHub's merge commit. Ask the owner to look at the footer.
- [ ] **Step 3:** After merge, the `acc` footer shows the merge commit. Promote to `main`, then check the stable footer. Do the housekeeping.

---

## Part 2: Service boundaries and page split

Branch: `refactor/service-boundaries` from `acc`.

### Task 6: Property service

**Files:**

- Create: `src/services/mockPropertyData.js`, `src/services/propertyService.js`, `src/services/propertyService.test.js`

**Interfaces:**

- Produces:
  - `DEFAULT_PROPERTY_ID = 'lange-hilleweg-73b'`
  - `getPublicProperty(propertyId)`, `getPersonalProperty(propertyId, session)`, `getBuildingData(propertyId, session)` and `getContractors(propertyId)`, all async.
  - Each returns a deep copy of `publicInfo`, `personalizedInfo`, `buildingData` or `contractors`.
  - Rejections use `Error` messages `Onbekende woning` and `Niet ingelogd`.

- [ ] **Step 1: Write the failing tests:**

```js
it('loads public data without a session', async () => {
  expect((await getPublicProperty(DEFAULT_PROPERTY_ID)).address).toBe('Lange Hilleweg 73 B');
});
it('refuses personal and building data without a session', async () => {
  await expect(getPersonalProperty(DEFAULT_PROPERTY_ID, null)).rejects.toThrow('Niet ingelogd');
  await expect(getBuildingData(DEFAULT_PROPERTY_ID, null)).rejects.toThrow('Niet ingelogd');
});
it('loads personal and building data with a session', async () => {
  const session = { user: 'demo' };
  expect((await getPersonalProperty(DEFAULT_PROPERTY_ID, session)).potentialSavings).toBe(
    '€ 850/jaar'
  );
  expect((await getBuildingData(DEFAULT_PROPERTY_ID, session)).gebouw.vloeroppervlakte_m2).toBe(
    120
  );
});
it('rejects an unknown property', async () => {
  await expect(getPublicProperty('onbekend')).rejects.toThrow('Onbekende woning');
});
it('returns copies', async () => {
  (await getContractors(DEFAULT_PROPERTY_ID))[0].name = 'x';
  expect((await getContractors(DEFAULT_PROPERTY_ID))[0].name).toBe('IsolatieGroep Rotterdam');
});
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL, because the modules are missing.
- [ ] **Step 3:** Move the four objects from `src/App.jsx:27-149` into `mockPropertyData.js` unchanged, keyed by property id. Implement the service with `structuredClone`. Leave `App.jsx` using its own copies until Task 10.
- [ ] **Step 4:** Run `npm test` and `npm run lint`. Expected: pass.
- [ ] **Step 5:** After owner go-ahead, commit `refactor: move property data behind a service`.

### Task 7: Session service and request guard

**Files:**

- Create: `src/services/authService.js`, `src/services/authService.test.js`, `src/lib/latestRequest.js`, `src/lib/latestRequest.test.js`

**Interfaces:**

- Produces:
  - `getSession()`, which resolves the mock session `{ user: 'demo' }` or `null`.
  - `login()`, which resolves that session.
  - `logout()`, which resolves `null`.
  - `resetSessionForTests()`.
  - `createLatestRequest(): { next(): number, isCurrent(token: number): boolean }`.

- [ ] **Step 1: Write the failing tests:**

```js
// authService.test.js
beforeEach(() => resetSessionForTests());
it('starts logged out', async () => expect(await getSession()).toBeNull());
it('logs in and out', async () => {
  expect(await login()).toEqual({ user: 'demo' });
  expect(await getSession()).toEqual({ user: 'demo' });
  await logout();
  expect(await getSession()).toBeNull();
});
// latestRequest.test.js
it('treats only the newest token as current', () => {
  const guard = createLatestRequest();
  const first = guard.next();
  const second = guard.next();
  expect(guard.isCurrent(first)).toBe(false);
  expect(guard.isCurrent(second)).toBe(true);
});
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL, because the modules are missing.
- [ ] **Step 3:** Implement both. The session lives in module memory only.
- [ ] **Step 4:** Run `npm test`. Expected: pass. After owner go-ahead, commit `refactor: add a mock session service and request guard`.

### Task 8: Calculation inputs and Operaton tests

**Files:**

- Create: `src/services/insulationParams.js`, `src/services/insulationParams.test.js`, `src/services/operatonService.test.js`

**Interfaces:**

- Produces: `buildInsulationParams(buildingData)`, which returns the five `baseParams` fields.
- Consumes: `fetchAllCalculations(baseParams)` and `transformOperatonResult` from the existing `operatonService.js`.

- [ ] **Step 1: Write the tests:**

```js
it("builds today's parameters", () => {
  expect(buildInsulationParams(buildingData)).toEqual({
    huidige_r_waarde: buildingData.bestaande_isolatie.R_waarde_m2K_per_W,
    dak_oppervlakte_m2: 120,
    lambda_w_mk: 0.035,
    materiaal_cost_per_m3: 80,
    install_cost_per_m2_per_100mm: 25,
  });
});
```

`operatonService.test.js` uses `vi.stubGlobal('fetch', ...)` and checks:

- four POSTs to `/api/engine-rest/decision-definition/key/bereken_isolatie_opties/evaluate`, for `doel_r_waarde` 3, 4, 6 and 8;
- headers exactly `{ 'Content-Type': 'application/json' }`;
- `transformOperatonResult` mapping one sample result;
- a `status: 500` response rejecting with `DMN evaluation failed (500)`.
- [ ] **Step 2:** Run `npm test`. Expected: the `insulationParams` test fails. The Operaton tests pass straight away, because they describe existing behaviour.
- [ ] **Step 3:** Implement `buildInsulationParams`, taking the existing values from `src/App.jsx:169-174`.
- [ ] **Step 4:** Run `npm test`. Expected: pass. After owner go-ahead, commit `test: pin calculation inputs and Operaton calls`.

### Task 9: Hooks

**Files:**

- Create: `src/hooks/useAuth.js`, `src/hooks/useProperty.js`, `src/hooks/useInsulationCalculation.js`

**Interfaces:**

- Produces:
  - `useAuth(): { session, isLoggedIn, login, logout }`.
  - `useProperty(propertyId, session): { publicInfo, personalInfo, buildingData, contractors }`. Each is `{ data, isLoading, error }`.
  - `useInsulationCalculation()`, which returns:
    - `consentGiven` and `setConsentGiven`;
    - `selectedContractor` and `setSelectedContractor`;
    - `showCalculations`, `calculations`, `isLoading` and `error`;
    - `reset()` and `requestCalculation(buildingData)`.
- Consumes: Tasks 6, 7 and 8.

- [ ] **Step 1:** Implement `useAuth` around `authService`, starting logged out.
- [ ] **Step 2:** Implement `useProperty`:
  - Public data and contractors load per `propertyId`.
  - Personal and building data load only with a session, and are set to `{ data: null, isLoading: false, error: null }` on logout.
  - Each source gets its own `createLatestRequest()`. A result is applied only while its token is current. Changing `propertyId` or `session` takes a new token.
- [ ] **Step 3:** Implement `useInsulationCalculation`:
  - `reset()` restores everything that `handleRoofInsulationClick` resets today.
  - `requestCalculation(buildingData)` keeps today's guard, which requires consent and a contractor. It calls `fetchAllCalculations(buildInsulationParams(buildingData))`.
- [ ] **Step 4:** Run `npm run lint` and `npm test`. Expected: pass, including `react-hooks/exhaustive-deps`. These hooks have no tests of their own, by design.
- [ ] **Step 5:** After owner go-ahead, commit `refactor: add hooks for session, property data and calculation`.

### Task 10: Page split

**Files:**

- Create: `src/components/PageHeader.jsx`, `PublicInfoSection.jsx`, `PersonalInfoSection.jsx`, `LoginPrompt.jsx`, `RoofInsulationModal.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1:** Record the CSS bundle hash from a build of `acc`, which includes Part 1.
- [ ] **Step 2:** Move the JSX blocks as they are:

  | Lines in today's `App.jsx` | Component             |
  | -------------------------- | --------------------- |
  | 190-222                    | `PageHeader`          |
  | 224-363                    | `PublicInfoSection`   |
  | 365-682, logged-in branch  | `PersonalInfoSection` |
  | 365-682, logged-out branch | `LoginPrompt`         |
  | 685-1049                   | `RoofInsulationModal` |

  `App.jsx` keeps only the hooks, `DEFAULT_PROPERTY_ID`, the modal-open state, the composition and `<Footer />`. Handlers stay in their current places:
  - the header button toggles `login` and `logout`;
  - the first recommendation card calls `reset()` and opens the modal;
  - the modal's close button only closes it.

- [ ] **Step 3:** Add the loading and error behaviour from the spec's table, with `Gegevens laden...` and short Dutch error text in existing Tailwind colours. The header renders without the address while public data is missing.
- [ ] **Step 4:** Run `npm test`, `npm run lint`, `npm run check-format` and `npm run build`. Compare the CSS hash with Step 1. Expected: equal, or the only difference is the classes the new messages need. Then grep `dist` for `localhost:8081` and `demo:demo`. Expected: none.
- [ ] **Step 5:** Ask the owner to compare on `localhost:5173`:
  - the logged-out and logged-in pages;
  - the login toggle;
  - opening the modal, completing a calculation against local Operaton, closing it, and reopening it with the state reset (Review Focus 3).

  To cover Review Focus 2, temporarily add a 2-second delay to `getBuildingData`. Ask the owner to open the modal straight after login and see the message. Then remove the delay.

- [ ] **Step 6:** After owner go-ahead, commit `refactor: split the page into sections`.

### Task 11: Ship Part 2

- [ ] **Step 1:** Push, and open the pull request into `acc`. Checks pass. Ask the owner to repeat the Task 10 comparison on the preview, against public Operaton.
- [ ] **Step 2:** After merge, verify `acc` and promote to `main`. Verify the stable site and do the housekeeping.
- [ ] **Step 3:** Run a fresh whole-branch review, then fix or record its findings.
