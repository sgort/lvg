# DMN decisions

## `bereken_isolatie_opties`

`bereken_isolatie_opties.dmn` is the source of the decision the LVG API calls for roof
insulation advice. Until 19 November 2026 it existed only as a deployment on Operaton.

It was taken unchanged from `operaton.open-regels.nl` on 19 November 2026:

| Field          | Value                                                                  |
| -------------- | ---------------------------------------------------------------------- |
| Version        | 21                                                                     |
| Definition id  | `bereken_isolatie_opties:21:e537ee02-de9f-11f1-938d-9ede454954c0`      |
| Deployment id  | `e531373e-de9f-11f1-938d-9ede454954c0`                                 |
| Resource name  | `dakisolatie-berekening-final.dmn`                                     |
| Source request | `GET /engine-rest/decision-definition/key/bereken_isolatie_opties/xml` |

The local Operaton used for development (version 1 there) runs identical XML.
