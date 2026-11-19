# Changelog

All notable changes to the LVG Wonen API. Versions follow the policy in `README.md`.

## 1.2.0

- `GET /woningen` answers frequently asked questions about koopwoningen
  (`veelgesteldeVragen`, optional), for the FAQ card on the Koopwoningen page. The questions are
  mock texts for this sandbox. Existing clients need no change.

## 1.1.0

Part 1b of the MijnOverheid Wonen plan, after Logius's code and authentication conditions of
11 November 2026, and the review findings in #35. Existing clients need no change.

- Every response in the contract has an example, validated by the API tests. The consent
  request has one too.
- `Advies` is bound to its status: a calculated advice always has `berekendOp`, `opties` and
  `uitgangspunten`; an unavailable advice always has a `melding`.
- The contract is readable in any language: `/openapi.json` no longer answers 406.
- The version policy is recorded in the contract and in `README.md`.
- Dates in the examples are quoted, so YAML 1.1 tools read them as strings, not timestamps.
- An `Accept-Language` header of only empty items means any language, as RFC 9110 says.
- The Rotterdam mock property has a fictional street, postcode, BAG id, parcel and WOZ number
  (#40). It was a real property.
- Fixes from #35: unreadable consent requests and paths, language negotiation per RFC 9110,
  a bounded consent store, a required Operaton setting on Azure, and error logs without
  request data.

## 1.0.0 — 19 November 2026

First version: the Wonen landing page, the citizen's properties with Kadaster, WOZ and energy
label data, roof insulation advice from Operaton, contractors, and a mocked consent.
