# LVG: Mijn Woning Overzicht

A demonstrator of a citizen's view of their home. It combines public property data
(cadastral data, energy label, WOZ value) with personal information after login, and
calculates roof insulation options with a DMN decision in Operaton.

LVG is a **sandbox**. Data and login are simulated, and the frontend is being prepared for
a full redesign. `main` is the stable release, not a production system.

## Sites

| Site                               | Source                                    | Deployed by                        |
| ---------------------------------- | ----------------------------------------- | ---------------------------------- |
| https://acc.lvg.open-regels.nl     | `acc`                                     | `azure-lvg-acc.yml`                |
| https://lvg.open-regels.nl         | `main`                                    | `azure-lvg-stable.yml`             |
| https://toestemming.open-regels.nl | `main`, `docs/Wireframes` as static files | `azure-toestemming-wireframes.yml` |

The footer of the LVG app shows which site and build you are viewing, for example
`acc.lvg.open-regels.nl · build c80d7d7 · #17`. A local build shows `local build`.

## Stack

React 18, Vite, Tailwind CSS 3, Vitest, ESLint and Prettier. The roof insulation
calculation calls the `bereken_isolatie_opties` decision through Operaton's REST API.

## Prerequisites

- Node.js in the version named in `.nvmrc`, with npm 11.10 or newer.
- A local Operaton on `http://localhost:8081` with `bereken_isolatie_opties` deployed, for
  the calculation during development.

## Getting started

```bash
npm ci
npm run dev
```

`npm run dev` first checks that `node_modules` matches `package-lock.json`. If it does not,
it stops and asks for `npm ci`. The app runs on http://localhost:5173.

### Operaton during development

The dev server forwards the app's evaluate call to `http://localhost:8081` and adds the
login on the server side, so it never reaches the browser. The default is `demo` / `demo`.
To use other credentials, create `.env.local`:

```bash
OPERATON_USER=your-user
OPERATON_PASSWORD=your-password
```

Deployed sites call the public endpoint `https://operaton.open-regels.nl/engine-rest`
without a login.

## Scripts

| Script                       | Purpose                                                       |
| ---------------------------- | ------------------------------------------------------------- |
| `npm run dev`                | Dependency check, then the Vite dev server                    |
| `npm run build`              | Production build in `dist/`                                   |
| `npm run preview`            | Serve the production build locally                            |
| `npm test`                   | Unit tests with Vitest                                        |
| `npm run lint`               | ESLint                                                        |
| `npm run format`             | Format with Prettier                                          |
| `npm run check-format`       | Check formatting                                              |
| `npm run deps:check`         | Check that the install matches the lockfile                   |
| `npm run check-previews`     | Find preview environments left behind by closed pull requests |
| `npm run check-supply-chain` | Check pinned actions against `SECURITY-PIPELINE.md`           |
| `npm run audit:signatures`   | Verify npm registry signatures                                |

Git hooks run lint-staged on commit, and the dependency check, lint, tests and format
check on push.

## How changes reach the sites

1. Branch from `acc` and open a pull request into `acc`. Checks run and a preview is
   deployed.
2. After merging, `acc.lvg.open-regels.nl` is updated.
3. A pull request from `acc` to `main` promotes the work. After merging, the stable release
   is updated.

`acc` and `main` accept changes only through pull requests, with required checks. Renovate
proposes dependency updates. See [SECURITY-PIPELINE.md](SECURITY-PIPELINE.md) for the
checks, pinning, rulesets and accepted Semgrep findings.

## Licence

[EUPL 1.2](LICENSE)
