# DMN decisions

## `bereken_isolatie_opties`

`bereken_isolatie_opties.dmn` is the source of the decision the LVG API calls for roof
insulation advice. Until 19 November 2026 it existed only as a deployment on Operaton.

### Origin

It was taken unchanged from `operaton.open-regels.nl` on 19 November 2026:

| Field          | Value                                                                  |
| -------------- | ---------------------------------------------------------------------- |
| Version        | 21                                                                     |
| Definition id  | `bereken_isolatie_opties:21:e537ee02-de9f-11f1-938d-9ede454954c0`      |
| Deployment id  | `e531373e-de9f-11f1-938d-9ede454954c0`                                 |
| Resource name  | `dakisolatie-berekening-final.dmn`                                     |
| Source request | `GET /engine-rest/decision-definition/key/bereken_isolatie_opties/xml` |

The local Operaton used for development ran identical XML, as its version 1.

### The decision

A decision table with hit policy COLLECT and four rules, one per target R-value: 3.0, 4.0,
6.0 and 8.0. A request for one target R-value returns the one matching rule.

| Input                           | Type    | Meaning                                    |
| ------------------------------- | ------- | ------------------------------------------ |
| `huidige_r_waarde`              | double  | Current R-value of the roof, m²·K/W        |
| `dak_oppervlakte_m2`            | double  | Roof area, m²                              |
| `doel_r_waarde`                 | double  | Target R-value: 3.0, 4.0, 6.0 or 8.0       |
| `lambda_w_mk`                   | double  | Thermal conductivity of the material, W/mK |
| `materiaal_cost_per_m3`         | integer | Material price per m³, €                   |
| `install_cost_per_m2_per_100mm` | integer | Labour price per m² per 100 mm, €          |

| Output               | Type    | Meaning                                               |
| -------------------- | ------- | ----------------------------------------------------- |
| `delta_r`            | double  | Increase in R-value                                   |
| `extra_dikte_mm`     | integer | Extra insulation thickness, mm                        |
| `materiaal_kosten`   | integer | Material cost, €                                      |
| `installatie_kosten` | integer | Installation cost, €                                  |
| `totale_kosten`      | integer | Total cost, €                                         |
| `subsidie`           | integer | Subsidy, €; a fixed amount per rule                   |
| `netto_kosten`       | integer | Cost after subsidy, €                                 |
| `besparing_jaar`     | integer | Saving per year, €; a fixed amount per rule           |
| `terugverdientijd`   | double  | Payback time, years                                   |
| `aanbeveling`        | string  | Recommendation text; only the 6.0 rule has one        |
| `aanbevolen`         | boolean | Added on 19 November 2026: `true` for 6.0, else false |

Subsidy and saving are fixed per rule, whatever the roof area. That is an open question in
the design (`docs/superpowers/specs/2026-11-19-mijnoverheid-wonen-ux-design.md`, question 7).

The LVG API takes the recommended option from `aanbevolen`. If a deployed version lacks that
output, no option is recommended; the API adds no rule of its own.

### Deploying to the local Operaton

```bash
bash scripts/deploy-dmn-local.sh
```

The script deploys every `.dmn` file in this folder to `http://localhost:8081/engine-rest` as
deployment `lvg-dmn`, with `deploy-changed-only=true`, so an unchanged file creates no new
version. It uses `OPERATON_USER` and `OPERATON_PASSWORD` (default `demo`) and refuses any
other engine.

### The public Operaton

The owner deployed the patched decision to `operaton.open-regels.nl` on 19 November 2026, as
version 22 (definition id `bereken_isolatie_opties:22:767275f2-e408-11f1-938d-9ede454954c0`,
resource `bereken_isolatie_opties.dmn`). Its XML matches this file, and it returns
`aanbevolen` without a login, so the deployed LVG sites can highlight the recommended option.

Deploying to the public Operaton stays the owner's step: the script above only deploys locally.
After a change here, check that both engines run the same XML.
