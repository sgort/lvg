# LVG Wonen API

The API behind the MijnOverheid Wonen pages. It returns what each page needs, already
decided: statuses, final amounts, allowed actions (`acties`) and the texts a citizen must see.
The front-end only presents them, as Logius's conditions ask (databron v15, section 7.4.1).
Data and consent are mocked; roof insulation advice comes from the Operaton decision
`bereken_isolatie_opties` (see `../dmn/README.md`).

The contract is `openapi.yaml` (OpenAPI 3.0.3). It is served at `/api/v1/openapi.json`, and
the `API-Version` header is read from it, so the two cannot drift apart.

## Layout

| Path             | Contents                                                              |
| ---------------- | --------------------------------------------------------------------- |
| `openapi.yaml`   | The contract, with an example for every response                      |
| `src/core/`      | Routing, language negotiation, problem responses, scenarios           |
| `src/resources/` | One handler per resource; each decides what its page shows            |
| `src/sources/`   | The registers, mocked                                                 |
| `src/mock/`      | Mock properties, contractors and scenarios                            |
| `src/operaton/`  | The Operaton client and the decision's parameters                     |
| `src/functions/` | The Azure Functions entry point (`lvg.js`)                            |
| `test/`          | Contract helpers: response validation, and the check of every example |
| `CHANGELOG.md`   | Changes per version                                                   |

## Running and testing

The API runs on Node 22, as Azure Static Web Apps managed functions. In development a Vite
plugin serves it inside the front-end's dev server, so `npm run dev` in the repository root
runs both. Local setup, settings and scenarios are in `../docs/runbook.md`.

From the repository root:

| Command                 | Purpose                                                     |
| ----------------------- | ----------------------------------------------------------- |
| `npm run test:api`      | API tests; every response is validated against the contract |
| `npm run lint:contract` | The contract against the Dutch API Design Rules             |

## Examples

Every response in `openapi.yaml` has at least one example, under its media type
(`examples.<name>.value`), and so does the consent request. They are taken from the handlers'
real output for the scenario `drie-woningen` (property `w-7f3a`), with the calculated advice
from `operaton.open-regels.nl`. `test/examples.test.js` checks that each response has one and
that each is valid against its schema. The front-end tests use them as fixtures, and they serve
as the example requests and responses Logius asks for.

When a handler's output changes, update its example in the same commit.

## Versiebeleid (version policy)

- The major version is in the path (`/api/v1`). `info.version` and the `API-Version` header
  carry the full semantic version.
- Additions that existing clients can ignore (new fields, new operations, new action types)
  raise the minor version. Fixes raise the patch version.
- A breaking change is only made in a new major version (`/api/v2`). The previous major version
  is served alongside for at least six months. Its responses then carry the `Deprecation` and
  `Sunset` headers, and the change is announced in `CHANGELOG.md` and to MijnOverheid before
  release.
- Every response in the contract has an example, which the API tests validate against its
  schema.

A version change touches `info.version` in `openapi.yaml`, its `ApiVersion` header example, and
`CHANGELOG.md`.
