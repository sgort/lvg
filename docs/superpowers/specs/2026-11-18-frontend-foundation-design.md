# LVG frontend foundation design

Date: 18 November 2026
Status: approved 18 November 2026; its non-goals are replaced by `2026-11-19-mijnoverheid-wonen-ux-design.md`

## Intent

A complete redesign of the LVG frontend is coming. It will bring new screens, and also
real address search, login and new data sources. Before it arrives, prepare this app so
those parts can replace today's hardcoded behaviour without first untangling
`src/App.jsx`.

The same work adds the two things the repository lacks: a build line in a page footer, so
every deployed site can answer "which build am I looking at?", and a proper root `README`.

LVG is a sandbox. `acc` serves `acc.lvg.open-regels.nl`; `main` is the stable release at
`lvg.open-regels.nl`. No versioned releases are made.

## Goals

- Screens get their data, session and calculation through clear boundaries.
- `src/App.jsx` becomes a short page that composes large sections.
- The LVG app on `acc` and the stable release show their host and build in a footer. The
  static wireframes site is only described in the README.
- The new boundaries and the build logic have automated tests.
- A newcomer can run, understand and deploy the app from `README.md`.

## Non-goals

- The redesign itself: no new screens, navigation, router or design system.
- Real address search, DigiD or other login, or new data sources.
- TypeScript, Tailwind 4, or the open Renovate pull requests.
- Component tests, browser tests or a coverage target.
- A version number, changelog or release process.
- Any mention of LVG in the `iou-architectuur` documentation site.

## Anti-goals

This work has failed, even if every check is green, if:

- the current page looks or behaves differently, apart from the new footer and the brief
  loading state described below;
- personal data becomes visible before login;
- deployed sites stop using `operaton.open-regels.nl`, or the local login or
  `localhost:8081` reaches a browser bundle;
- services are shaped so that a real backend would still force screen rewrites.

## Current state

`src/App.jsx` has 1,053 lines and one component:

| Lines    | Content                                                                  |
| -------- | ------------------------------------------------------------------------ |
| 18-25    | Eight `useState` values                                                  |
| 27-149   | `publicInfo`, `personalizedInfo`, `buildingData`, `contractors`          |
| 151-187  | Open-modal reset and the calculation handler, with fixed cost parameters |
| 190-222  | Page header with a simulated login toggle                                |
| 224-363  | Public information: cadastral map, energy label, WOZ value               |
| 365-682  | Personal information when logged in, otherwise the login prompt          |
| 685-1049 | Roof insulation modal: building data, consent, contractor, calculation   |

`src/services/operatonService.js` already holds the Operaton calls and result mapping.
There is no test runner and no footer.

## Approaches

| Approach                                   | Trade-off                                                                                | Outcome                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- | ----------------------- |
| Service boundaries with a light page split | Moderate change. Real sources later replace service internals                            | **Chosen by the owner** |
| Move data only                             | Smallest change, but screens stay tied to data and the separation waits for the redesign | Rejected                |
| Build the target structure now             | Furthest ahead, but guesses at an undelivered design                                     | Rejected                |

## Design

Two pull requests into `acc`, each verified and promoted to `main` before the next.

### Part 1: README, build footer and tests

**Test runner**

- Add Vitest, on the major used by `ttl-editor`, with `npm test` as `vitest run`.
- Tests run in Node and import from `vitest` explicitly. No jsdom or Testing Library.
- Run `npm test` before the build in `azure-lvg-acc.yml` and `azure-lvg-stable.yml`, and in
  the pre-push hook after lint.
- Update `SECURITY-PIPELINE.md`: `Build and deploy ACC` now also covers tests, and a test
  suite is no longer listed as left out.

**Build information**

- `src/lib/buildInfo.js` is the JavaScript port of RBA's
  `packages/public-site/src/lib/buildInfo.ts`, with `getBuildInfo()` returning `sha`,
  `shortSha`, `run`, `isTracked` and `label`.
- It reads `VITE_BUILD_SHA` and `VITE_BUILD_RUN` inside the function. Blank values count as
  absent, and a SHA without a run, or a run without a SHA, gives `local build`.
- `src/lib/buildInfo.test.js` ports RBA's eight tests.
- The build step of both LVG workflows gets `VITE_BUILD_SHA: ${{ github.sha }}` and
  `VITE_BUILD_RUN: ${{ github.run_number }}`. Nothing is derived from git at build time.
- Each workflow also sets `VITE_SITE_URL`: `https://acc.lvg.open-regels.nl` and
  `https://lvg.open-regels.nl`.

**Footer**

- `src/components/Footer.jsx` shows one recessive monospace line:
  `lvg.open-regels.nl · build c80d7d7 · #17`.
- The host links to the site URL, with `https://lvg.open-regels.nl` as fallback. The full
  SHA is the `title` of the build text. Locally the build text is `local build`.
- There is no version number.
- It sits at the bottom of the page, logged in or not, and outside the modal. Styling uses
  existing Tailwind colours and fits the page width.

**README**

`README.md` covers: what LVG is, including that it is a sandbox; the three sites; the stack;
prerequisites; local setup with `npm ci` and `npm run dev`; local Operaton on
`localhost:8081` with the `bereken_isolatie_opties` decision, the default dev login and its
`.env.local` override; scripts; the `acc` to `main` pull-request flow and deployments; links
to `SECURITY-PIPELINE.md`; and the EUPL 1.2 licence. It does not point to the documentation
site.

### Part 2: Service boundaries and page split

**Target structure**

```text
src/
  App.jsx                         page composition only
  components/
    Footer.jsx
    PageHeader.jsx
    PublicInfoSection.jsx
    PersonalInfoSection.jsx
    LoginPrompt.jsx
    RoofInsulationModal.jsx
  hooks/
    useAuth.js
    useProperty.js
    useInsulationCalculation.js
  lib/
    buildInfo.js
  services/
    authService.js
    insulationParams.js
    operatonService.js
    propertyService.js
    mockPropertyData.js
```

Large sections are moved as they are. Smaller presentational components are not extracted,
because the redesign will replace that markup.

**Services**

All functions are async, so real network calls can replace their internals.

| Function                                   | Today                                                 | Later                        |
| ------------------------------------------ | ----------------------------------------------------- | ---------------------------- |
| `getPublicProperty(propertyId)`            | Returns `publicInfo`                                  | Address and public registers |
| `getPersonalProperty(propertyId, session)` | Returns `personalizedInfo`; rejects without a session | Authenticated source         |
| `getBuildingData(propertyId, session)`     | Returns `buildingData`; rejects without a session     | Authenticated source         |
| `getContractors(propertyId)`               | Returns `contractors`                                 | Contractor source            |
| `getSession()`                             | Returns the mock session or `null`                    | Real session lookup          |
| `login()` / `logout()`                     | Toggle an in-memory mock session                      | DigiD or another provider    |

- `propertyService.js` exports `DEFAULT_PROPERTY_ID`, the one mock property. `App.jsx` passes
  it down until address search supplies a real value. An unknown id rejects.
- Returned data is a copy, so screens cannot change the mock source.
- The mock session is not persisted, so a page reload logs out, as it does today.
- `mockPropertyData.js` is imported only by `propertyService.js`.

**Hooks**

- `useAuth()` gives `session`, `isLoggedIn`, `login` and `logout`.
- `useProperty(propertyId, session)` gives `publicInfo`, `personalInfo`, `buildingData` and
  `contractors`, each as its own `{ data, isLoading, error }`. Personal and building data load
  only with a session and are cleared on logout. A response for an earlier property or
  session is ignored.
- `useInsulationCalculation()` holds consent, contractor, visibility, results, loading and
  error state. It exposes `reset()` and `requestCalculation(buildingData)`.

**Calculation inputs**

`buildInsulationParams(buildingData)` in `insulationParams.js` returns today's
`huidige_r_waarde`, `dak_oppervlakte_m2`, `lambda_w_mk: 0.035`, `materiaal_cost_per_m3: 80`
and `install_cost_per_m2_per_100mm: 25`. `operatonService.js` keeps its base URL rules and
sends no `Authorization` header.

**Allowed visible differences**

Mock data now arrives asynchronously, so a short neutral "Gegevens laden..." state may
appear. Loading and failure stay local to the part that needs the data, each with a short
Dutch message:

| Source        | While loading or after failure                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Public data   | The header and login button still render, without the address. The public section shows the message   |
| Personal data | Only the personal section shows the message. The public section stays visible, including during login |
| Building data | The recommendation card stays usable. The modal opens and shows the message instead of its steps      |
| Contractors   | Only the contractor step in the modal shows the message                                               |

Everything else keeps its text, styling, order and interaction.

**Tests**

- `propertyService`: public data loads without a session; personal and building data reject
  without one and load with one; an unknown property id rejects; changing returned data does
  not change later results.
- `authService`: login, logout and the initial logged-out state.
- `insulationParams`: exact output for the current building data.
- `operatonService`: URL, method, payload and no `Authorization` header with a mocked
  `fetch`; result mapping; and a non-OK response becoming an error.

## Verification

| Part | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `npm test`, lint, format check and build pass, locally and in CI. A build with test values contains both injected literals somewhere in `dist/`, and a build without them gives `local build`. The owner sees `local build` locally. On a preview the footer shows the acceptance host and a build id; a preview SHA is GitHub's merge commit. After merge the footer shows the real commit on `acc`, and on the stable site after promotion. |
| 2    | Tests, lint, format check and build pass. The generated CSS is unchanged from Part 1, or any difference is explained. `dist/` contains no `localhost:8081` or `demo:demo`. The owner compares logged-out and logged-in pages and completes the modal calculation against local Operaton, then on the preview.                                                                                                                                 |

## Constraints

- Work reaches `acc` and `main` only through pull requests. Ask before every commit.
- No Claude attribution. Do not bypass hooks. Do not start or stop the dev server, and leave
  `npm ci` to the owner.
- Dependency changes follow `.npmrc`, and the owner stops the dev server first.

## Left to the builder

- Exact prop shapes between sections.
- Exact Tailwind classes for the footer and the loading and error messages.
- README wording.
- Commit order within each part.
