# MijnOverheid Wonen: UX design and front-end architecture

Date: 19 November 2026
Status: iteration 1, reviewed with the owner on 19 November 2026
Replaces: the non-goals of `2026-11-18-frontend-foundation-design.md` (no redesign, router,
design system or backend). Its services, hooks, tests and build footer carry over.

## Intent

LVG delivers the "Wonen" content pages for MijnOverheid: the pages a homeowner sees after
DigiD login under the Wonen tab. Logius publishes them. This spec turns the G&B designs into
working pages and adds the one working user story that runs from start to finish: **roof
insulation advice from the Operaton decision `bereken_isolatie_opties`, followed by sharing
data with a contractor through a consent step.** Every other part uses mock data until real
sources are connected.

The functional design for Logius (`Template FO MijnOverheid`) and the connection paperwork
come later, after several iterations of this design have stabilised. This spec is written so
the functional design can be derived from it: each page lists its elements, sources and
states.

## Sources

| Source                                                    | Location                                                                                           |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| UX deck, October 2026 (six content pages, notes per page) | `202610_UX_Ontwerp_MijnOverheid.pdf` (supplied by the owner, not in the repository)                |
| Figma exports, desktop and mobile per page                | `docs/LVG - Wonen - MijnOverheid - Web - G&B/`                                                     |
| Figma file (access pending; see open questions)           | `figma.com/design/CoQvDG2knkwLCPafpMqiy8`                                                          |
| Logius connection conditions for data sources, v15        | `Aansluitvoorwaarden MijnOverheid (databron)`, 21 October 2026                                     |
| Consent wireframes (DvTP, stelselfunctie S02)             | `docs/Wireframes/toestemming-wireframes.html`, deployed at `toestemming.open-regels.nl`            |
| GBO global design                                         | `https://ictu.github.io/GBO-GO/latest/`                                                            |
| Existing roof insulation flow                             | `src/components/RoofInsulationModal.jsx`, `src/services/operatonService.js`, `insulationParams.js` |

The Figma exports lack a desktop version of the landing page ("Wonen"). Its desktop layout
comes from the deck, page 2.

## Decisions made on 19 November 2026

| Topic                      | Decision                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Who builds the front-end   | LVG delivers the code. Logius's "Aansluitvoorwaarden MijnOverheid (code)" also applies; it is not yet in hand |
| Business logic             | A thin LVG API returns outcomes. The front-end only presents them. The OpenAPI contract is written first      |
| API hosting                | Azure Static Web Apps managed Functions, in `api/` in this repository                                         |
| Roof insulation placement  | A "Verduurzamen" block on the Energielabel page links to a separate "Dakisolatie" page                        |
| Next step after the advice | Consent and contractor choice, following the consent wireframes (DvTP pattern), mocked                        |
| Frame around the content   | A stand-in MijnOverheid frame, clearly marked, that can be switched off                                       |
| Citizen simulation         | A development scenario switch: no property, one property, three properties. No login toggle                   |
| Old mock-ups               | `docs/Mock-up/` is removed                                                                                    |
| Styling                    | NL Design System through the Rijkshuisstijl Community components and tokens. Tailwind is removed              |
| Runbook                    | `docs/runbook.md`                                                                                             |
| List page name             | `Koopwoningen` (the desktop export's `Gebouwen` is outdated). Rental properties are out of scope              |
| DMN                        | In scope: the DMN moves into this repository and gets an `aanbevolen` output; deployed to local Operaton only |
| Who implements             | A separate Claude Code session, guided by `CLAUDE.md` and the plan. Part 0 is prepared in this session        |

## Goals

- All seven content pages and the consent steps work in the browser on `acc`, desktop and
  mobile, with mock data where no source exists.
- The roof insulation advice is calculated by Operaton on every visit, through the LVG API.
- The front-end holds no business rules: no thresholds, cost figures, target values,
  calculations or status derivations. It formats and lays out what the API returns.
- The API contract passes the API Design Rules linter and meets section 7.4 of the Logius
  conditions, so the later connection to MijnOverheid needs no redesign.
- The pages meet WCAG 2.2 AA, use B1 Dutch, and use NL Design System components.
- A newcomer can run, change and deploy the whole thing from `README.md` and `docs/runbook.md`.

## Non-goals

- Real data sources (BAG, BRK, LV WOZ, EP-online, ISDE), real DigiD, real consent registry.
- The rental path ("Ik ben huurder"), "Berichten over uw Buurt" content, and consent
  management ("Beheer gegevens", wireframes 1a–1c).
- English or other languages. Only the plumbing for language is built (see Logius conditions).
- The real MijnOverheid frame, menus or navigation. The stand-in frame is not delivered.
- The functional design document and the Logius connection paperwork.

## Anti-goals

This iteration has failed, even if every check is green, if:

- any cost figure, target R-value, threshold or status rule is in `src/`;
- the browser calls Operaton, or Operaton credentials or `localhost:8081` reach the bundle;
- a URL, log line or browser storage holds an address, BSN or other personal data;
- the roof insulation story cannot be completed against local Operaton and on the preview;
- removing the stand-in frame changes anything in the content pages.

## What the Logius conditions mean here

| Condition (section)                                  | Consequence in this design                                                                                                                          |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Front-end holds no business logic (5, 7.4, 7.4.1)    | Cost parameters, target R-values, the recommended option, validity and allowed actions all come from the API. `insulationParams.js` moves to `api/` |
| Deliver a status, not two dates (7.4.1)              | Energy label validity comes as `status` plus dates for display. The front-end never compares dates                                                  |
| Deliver the result of a calculation (7.4.1)          | The API returns final, rounded amounts per option, including cost per m². No arithmetic in the front-end                                            |
| Deliver the allowed actions (7.4.1)                  | Each resource carries `acties`: links the page may offer (for example "bekijk-dakisolatie", "deel-met-aannemer")                                    |
| On error, say what the citizen can do (7.4.1)        | Errors use `application/problem+json` with an extra `burgerActie` text, shown as is                                                                 |
| REST, ADR, JSON, UTF-8, OAS 3.x (7.4)                | `/api/v1/...`, `openapi.json` served by the API, ADR linter in CI                                                                                   |
| `Accept-Language` / `Content-Language` (7.4.2)       | Every request sends `Accept-Language: nl`. The API answers with `Content-Language: nl`; other values give 406 for now                               |
| Language segment in the MijnOverheid URL (7.4.2)     | Routes start with `/nl/`                                                                                                                            |
| Semantic versioning, version info (7.4.2)            | `info.version` in the contract and an `API-Version` response header                                                                                 |
| Authentication, IP allowlisting, SLA (7.2, 7.3, 7.5) | Not in this iteration. Recorded for the connection phase                                                                                            |

## Information architecture

Routes are relative to a configurable base path, so MijnOverheid can mount them under its own
URL. `:woningId` is an opaque identifier from the API, never an address or a BAG id that
reveals one.

| Route                                                       | Page                      | Breadcrumb (desktop)                  | Back link (mobile) | API resource                               |
| ----------------------------------------------------------- | ------------------------- | ------------------------------------- | ------------------ | ------------------------------------------ |
| `/nl/wonen`                                                 | Wonen (landing)           | Home › Wonen                          | Home               | `GET /api/v1/wonen`                        |
| `/nl/wonen/koopwoningen`                                    | Koopwoningen (list)       | Home › Wonen › Koopwoningen           | Wonen              | `GET /api/v1/woningen`                     |
| `/nl/wonen/koopwoningen/:woningId`                          | Woning (summary)          | … › Koopwoningen › [adres]            | Koopwoningen       | `GET /api/v1/woningen/{id}`                |
| `/nl/wonen/koopwoningen/:woningId/kadaster`                 | Kadastrale gegevens       | … › [adres] › Kadaster                | [adres]            | `GET /api/v1/woningen/{id}/kadaster`       |
| `/nl/wonen/koopwoningen/:woningId/woz`                      | WOZ-gegevens              | … › [adres] › WOZ                     | [adres]            | `GET /api/v1/woningen/{id}/woz`            |
| `/nl/wonen/koopwoningen/:woningId/energielabel`             | Energielabel              | … › [adres] › Energielabel            | [adres]            | `GET /api/v1/woningen/{id}/energielabel`   |
| `/nl/wonen/koopwoningen/:woningId/energielabel/dakisolatie` | Dakisolatie (new)         | … › Energielabel › Dakisolatie        | Energielabel       | `GET /api/v1/woningen/{id}/dakisolatie`    |
| `…/dakisolatie/aannemer`                                    | Kies een aannemer (new)   | … › Dakisolatie › Aannemer kiezen     | Dakisolatie        | `GET /api/v1/woningen/{id}/aannemers`      |
| `…/dakisolatie/toestemming`                                 | Toestemming (new)         | … › Dakisolatie › Toestemming         | Aannemer kiezen    | `POST /api/v1/woningen/{id}/toestemmingen` |
| `…/dakisolatie/toestemming/:kenmerk`                        | Toestemming gegeven (new) | … › Dakisolatie › Toestemming gegeven | Dakisolatie        | `GET /api/v1/toestemmingen/{kenmerk}`      |
| any other path                                              | Pagina niet gevonden      | Home                                  | Home               | none                                       |

`[adres]` is the short address from the API (`Straatnaam 23`), never taken from the URL.

The list page is named "Koopwoningen", as in the deck and the mobile export. The desktop export's
"Gebouwen" is outdated and is not used, in the title or in the breadcrumb.

## Shared patterns

These come from the Figma exports and apply to every page. Each maps to a Rijkshuisstijl
Community component where one exists.

| Pattern            | Design                                                                                              | Component                                      |
| ------------------ | --------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Page title         | H1 under the breadcrumb (desktop) or back link (mobile)                                             | `Heading`                                      |
| Breadcrumb         | Desktop only, from 768 px                                                                           | `BreadcrumbNav`                                |
| Back link          | Mobile only: `‹ [parent]`                                                                           | `Link` with icon                               |
| Content card       | White card with a light shadow; sections inside with bold subheadings                               | `Card` or a local `ContentCard` on tokens      |
| Data list          | Label left, value right on desktop; label above value on mobile                                     | `DataSummary` / `DataSummaryItem`              |
| More link          | Bold blue `Bekijk … ›` at the end of a section                                                      | `Link` (router link)                           |
| Info button        | Blue `i` next to a value, opens a short explanation                                                 | `Toggletip`                                    |
| Info box           | Light blue box with an `i` icon                                                                     | `Alert` (type info)                            |
| Download link      | Download icon plus underlined link text with `(pdf)`                                                | `Link` with icon                               |
| External link      | External-link icon plus underlined text                                                             | `Link` with icon, `rel="noopener"`             |
| Contact card       | "Contactinformatie", organisation, website, e-mail                                                  | local `ContactCard`                            |
| FAQ card           | "Veelgestelde vragen", three collapsed items, "Bekijk alle veelgestelde vragen ›"                   | `Accordion` plus `Link`                        |
| Address subtitle   | The full address as the first line inside the main card, larger text                                | `Heading` level 2, styled                      |
| Energy label scale | Seven coloured blocks, A (dark green) to G (red); the active class is larger and carries the letter | local `EnergielabelSchaal` (no NLDS component) |

The red "Dit is een schets" text in the designs is a Figma marker and is not built.

Every page has three data states besides the filled one:

- **Loading:** the page title and breadcrumb render at once; the card shows `Gegevens laden…`
  with `aria-busy`.
- **Error:** the card shows an `Alert` (type error) with the API's `title` and `burgerActie`
  text, and a `Probeer opnieuw` button.
- **Not found (404):** the page "Deze woning is niet gevonden" with a link back to Koopwoningen.

## Page designs

Dutch copy is given as it will appear. `[…]` marks values from the API. Text between
`{…}` is still a design placeholder; it is built as written and listed under open questions.

### 1. Wonen (landing)

From the deck, page 2, and `wonen - mobile.pdf`. Three cards in a grid: two columns on desktop,
one on mobile.

| Card                    | Content                                                                                                                                                                            | Button                      | Target in this iteration                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | -------------------------------------------- |
| Berichten over uw Buurt | **Bron: Officiële Bekendmakingen** · U vindt hier berichten over vergunningen in uw buurt, zoals evenementen en bouwplannen. Ook vindt u de bekendmakingen van nieuwe regelgeving. | `Berichten over uw Buurt ›` | External link from the API (placeholder URL) |
| Ik ben woningeigenaar   | **Bron: LVG** · {Ingang LVG}                                                                                                                                                       | `Bekijk koopwoningen ›`     | Koopwoningen                                 |
| Ik ben huurder          | **Bron: LVG** · {intro}                                                                                                                                                            | `Bekijk huurwoningen ›`     | Page "Nog niet beschikbaar" (out of scope)   |

The API decides which cards appear (`acties`). Following the deck note, the landing page stays
visible as long as there are separate pages for buyers and renters.

### 2. Koopwoningen (list)

From `koopwoningen - desktop.pdf` / `- mobile.pdf`.

- Title `Koopwoningen`. Card with `{intro, algemene informatie}` and the subheading `Uw gebouwen:`.
- One row per property, as a full-width link with a `›` chevron: the address on line 1 (blue,
  bold); on line 2 the small energy label tile (letter on the label colour) and `[soort],
[bouwjaar]`, for example `Koopwoning, 1994`.
- Followed by the FAQ card.

Behaviour, which the API decides through `weergave` (see API):

- One property: the API answers `weergave: "direct"`. The page replaces itself with that
  property's page (history replace, so Back does not loop).
- Several properties: the list.
- No properties: the card shows `U heeft geen koopwoning op uw naam staan.` and a link
  `Klopt dit niet? Neem contact op met het Kadaster ›` (placeholder URL).

### 3. Woning (summary)

From `koopwoning detail - desktop.pdf` / `- mobile.pdf` and deck page 4. Title: `[Straatnaam]
[Huisnummer]`. One main card with four sections:

1. **Basisregistratie Adressen en Gebouwen (BAG):** Adres, Bouwjaar, Gebruiksdoel,
   Oppervlakte, Verblijfsobject.
2. **Kadastrale gegevens:** Kadastrale aanduiding, Kadastrale grootte. Link `Bekijk kadastrale
gegevens ›`.
3. **WOZ-gegevens:** WOZ-waarde, Waardepeildatum, each with an info button. Link `Bekijk
WOZ-gegevens ›`.
4. **Energielabel:** the label scale, Opnamedatum. Link `Bekijk energielabel ›`.

Followed by the FAQ card. A section whose source failed shows its own short error line
(`Deze gegevens zijn nu niet beschikbaar.`) while the other sections stay visible: the API
returns each section with its own `status`.

### 4. Kadastrale gegevens

From `koopwoning detail kadaster - desktop.pdf` and deck page 5. Source holder: Kadaster.

- Main card: the address subtitle, then:
  - **Kadastrale kaart:** a map image (mock: `public/perceel-1560.png`, already in the
    repository) with the parcel marked, and a `[Download link]`.
  - **Kadastrale gegevens:** Kadastrale aanduiding, Kadastrale grootte, Koopsom,
    Publiekrechtelijke beperkingen, Bebouwing as text; Beperkte rechten, Hypotheekbedrag,
    Hypotheekgever, Hypotheeknemer and Zakelijke rechten as external links to (paid) Kadaster
    products.
  - **Eigenaarsinformatie:** `In Eigenaarsinformatie vindt u informatie over geregistreerde
objecten die op uw naam staan in de Basisregistratie Kadaster. U bent van deze objecten
de gerechtigde. Een uitgebreide toelichting op deze informatie vindt u op de webpagina van
het Kadaster.` ("Kadaster" is an external link.) Then `Download eigenaarsinformatie (pdf)`.
  - **Luchtfoto's** and **Panoramafoto's:** two accordions, both open by default as in the
    design, each with one image (mock: a placeholder image with alt text).
- Contact card (Kadaster), FAQ card.

### 5. WOZ-gegevens

From `koopwoning detail woz - desktop.pdf` and deck page 6. Source holder: Ministry of
Finance / Kadaster (LV WOZ).

- Main card: the address subtitle, subheading **WOZ-gegevens**: WOZ-waarde, Waardepeildatum,
  Grondoppervlakte, WOZ-objectnummer, WOZ-objecttype, Taxatieverslag (download link
  `Taxatieverslag (pdf)`). Each row has an info button; its text comes from the API.
- Contact card (the municipality or tax body; from the API), FAQ card.

### 6. Energielabel

From `koopwoning detail energielabel - desktop.pdf` and deck page 7. Source holder: RVO.

- Main card: the address subtitle, then:
  - `Energielabel van uw [woning|gebouw]`, the label scale, `Uw [woning|gebouw] heeft
energielabel [C]`, the download `Energielabel [klasse] [postcode] [huisnummer] (pdf)`.
  - `Opnamegegevens van uw [woning|gebouw]` / `(Op basis van deze gegevens is het energielabel
van uw [woning|gebouw] bepaald)`, download `Opnamegegevens (pdf)`.
  - Data list: Registratiedatum, Opnamedatum, Geldig tot, ISDE-gegevens (external link, info
    button).
  - Info box: `In dit overzicht ziet u voor welke verduurzamingsmaatregelen in uw woning in het
verleden de Investeringssubsidie duurzame energie en energiebesparing (ISDE) is verleend.
Het gaat om afgeronde subsidieaanvragen. Deze informatie is alleen bedoeld om u te
informeren. U kunt de gegevens niet aanpassen.`
- **New: Verduurzamen card** between the main card and the contact card. Shown only when the
  API offers the action `bekijk-dakisolatie`:
  - Heading `Uw woning verduurzamen`.
  - Text: `Wij hebben voor uw woning berekend wat betere dakisolatie kost en oplevert. U ziet
ook welke subsidie mogelijk is.`
  - Link `Bekijk advies dakisolatie ›`.
- Contact card (RVO), FAQ card.

`[woning|gebouw]` is the API's `objectAanduiding` (`woning` or `gebouw`); the front-end does
not derive it from the building's use.

### 7. Dakisolatie (new)

Replaces the current roof insulation modal. Not in Figma; designed here in the same patterns.
The order changes on purpose: today the calculation only runs after consent and a contractor
choice. Now the advice comes first, because it is calculated for the citizen from their own
data by the government. Sharing with a contractor is the follow-up.

Title `Dakisolatie`. The address subtitle in the first card.

**Card 1: Uw dak nu**

- Intro: `Dit zijn de gegevens over uw dak die wij voor de berekening gebruiken.`
- Data list: Huidige isolatie (`[type], [dikte] mm`), Huidige R-waarde (`[2,8] m²·K/W`, info
  button: `De R-waarde laat zien hoe goed uw dak warmte vasthoudt. Hoe hoger, hoe beter.`),
  Dakoppervlakte (`[120] m²`), Daktype (`[Zadeldak]`).
- Small print: `Bron: [bronnen uit de API]`. Link `Klopt dit niet?` → placeholder.

**Card 2: Ons advies**

- Highlighted box (`Alert`, type ok) for the option the API marks as `aanbevolen`:
  - `Wij adviseren isolatie tot R [6,0].`
  - Data list: Extra isolatie (`[100] mm`), Kosten (`€ [4.080]`), Subsidie (`€ [1.000]`),
    Kosten na subsidie (`€ [3.080]`), Besparing per jaar (`€ [350]`), Terugverdientijd
    (`[8,8] jaar`).
  - The DMN's own recommendation text (`aanbeveling`), if present.
- `Andere mogelijkheden`: a table, one row per option, columns `R-waarde`, `Extra isolatie`,
  `Kosten na subsidie`, `Besparing per jaar`, `Terugverdientijd`. On mobile, every option is
  a stacked data list. Caption: `Vergelijking van isolatie-opties voor uw dak`.
- Accordion `Hoe hebben we dit berekend?`: the assumptions as delivered by the API (λ, material
  price, labour price, calculation date), and `Dit is een indicatie. De echte kosten hoort u
van een aannemer.`

**Card 3: Wat kunt u nu doen?**

- `Wilt u een offerte? Kies een aannemer. U bepaalt zelf welke gegevens u met de aannemer
deelt.`
- Button `Offerte aanvragen bij een aannemer` → Kies een aannemer. Shown only when the API
  offers the action `deel-met-aannemer`.
- Link `Meer over subsidie voor isolatie (ISDE) ›` (external, from the API).

Contact card (LVG), FAQ card.

Errors: if Operaton fails, card 2 shows the API's error with `burgerActie` (for example `Wij
kunnen het advies nu niet berekenen. Probeer het later opnieuw.`). Cards 1 and 3 stay visible;
the button in card 3 stays hidden, because the API offers no action.

### 8. Toestemming (new, from the consent wireframes)

The wireframes start at the contractor's side (2a). In MijnOverheid the citizen starts, so
2a is replaced by a contractor choice. Screens 2b and 2c are followed closely; their FR
references (FR-05, 07, 08, 10, 11, 14, 36, 38) carry over.

**8a. Kies een aannemer**

- Title `Kies een aannemer`. Intro: `Kies het bedrijf dat u een offerte wilt laten maken. In
de volgende stap ziet u welke gegevens u deelt.`
- A radio group, one option per contractor from the API: name in bold, specialism below. No
  ratings: the government does not rate companies (open question 6).
- Buttons `Volgende` (primary) and `Annuleren` (back to Dakisolatie). Submitting without a
  choice shows the field error `Kies een aannemer.`

**8b. Toestemming voor het delen van uw gegevens** (wireframe 2b)

- Summary: `Aanvrager [naam aannemer] — het bedrijf ontvangt de gegevens` · `Doel Offerte
voor dakisolatie maken`.
- `1 Welke gegevens worden gedeeld?` `U ziet hier niet de gegevens zelf, alleen wélke
gegevens worden gedeeld. Binnen een set kunt u geen losse gegevens uitzetten.` One block
  per data set from the API, each with its source, its elements, and either `Verplicht — staat
vast` or an on/off switch. First pass:
  - Woning en dak · bron: LVG (Kadaster, BAG): adres, bouwjaar, dakoppervlakte, daktype —
    verplicht.
  - Huidige isolatie · bron: LVG: soort, dikte, R-waarde — verplicht.
  - Energiegegevens · bron: RVO (EP-online): energielabel, eerder toegekende
    verduurzamingssubsidies — optioneel, aan.
  - Advies dakisolatie · bron: LVG: het advies van de vorige pagina — optioneel, uit.
- `2 Hoe lang mag het bedrijf de gegevens ophalen?` Radio group with the durations from the
  API (7, 14, 30 days), default `14 dagen`, showing `verloopt op [datum]` as computed by the
  API.
- `3 In het kort`: `U deelt eenmalig gegevens over uw woning en dak, zodat [naam] een offerte
kan maken. U kunt dit later intrekken.` Link `Lees de volledige juridische tekst` (opens an
  accordion with placeholder text).
- Checkbox `Ik heb gelezen welke gegevens worden gedeeld, met wie en waarvoor.`
- Buttons `Toestemming geven` (primary; disabled until the box is ticked, with
  `aria-describedby` explaining why) and `Weigeren` (secondary; back to Dakisolatie with the
  message `U heeft geen gegevens gedeeld.`).
- `Meedoen is vrijwillig. U kunt ook zelf contact opnemen met een aannemer.`

**8c. Toestemming gegeven** (wireframe 2c)

- Title `Toestemming gegeven`. `[naam] kan uw gegevens nu ophalen om een offerte te maken.`
- Data list: Gedeeld met, Voor, Geldig tot (`[datum] ([n] dagen)`), Kenmerk
  (`[TS-2026-…]`).
- `U kunt deze toestemming intrekken via Beheer gegevens.` (Beheer gegevens shows "Nog niet
  beschikbaar" in this iteration.)
- Link `Terug naar uw woning ›`.

The consent is mocked in the API. Its contract follows the DvTP pattern C described in GBO:
the citizen gives consent, the provider later gets a consent id. No data leaves the mock.

### 9. Shared pages

- `Pagina niet gevonden`: `Deze pagina bestaat niet (meer).` Link `Naar Wonen ›`.
- `Nog niet beschikbaar`: `Deze pagina is nog in ontwikkeling.` Link back.

## Stand-in frame and scenario switch

The stand-in frame reproduces the frame visible in the designs, only far enough to read the
content in context: a header with the Rijksoverheid logo, `MijnOverheid`, `English`, the
citizen's name and `Uitloggen` (inactive); the side menu (Home, Berichtenbox with a badge,
Lopende zaken, Identiteit, Financiën, Werk, Gezondheid, Wonen (active), Vervoer, Onderwijs,
Instellingen; all except Wonen inactive); and the dark footer with its four columns.

- A band above the header says: `Nagebootst MijnOverheid-kader. Geen onderdeel van de
oplevering.`
- The frame lives in `src/frame/`. Content pages do not import from it. It is switched off
  with `VITE_FRAME=off` at build time or `?kader=uit` at run time; the content then renders
  in a plain page with the same width as the MijnOverheid content column.
- The **scenario switch** sits in the band: a select with `Geen woning`, `Eén woning` and
  `Drie woningen` (default). The choice goes to the API as the header `X-LVG-Scenario` and is
  kept in `sessionStorage` (no personal data; only the scenario name). The API ignores the
  header unless `LVG_SCENARIOS=on` is set, which it is on `acc`, previews and locally, and
  not in any future production setup.
- The build line (`lvg.open-regels.nl · build c80d7d7 · #17`) moves from the page footer into
  the band.

## Front-end architecture

### Stack

| Part       | Choice                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| Framework  | React 18 (unchanged). React 19 is left to a later iteration and to Logius's code conditions              |
| Routing    | React Router 7 in data mode (`createBrowserRouter` with loaders), basename configurable                  |
| Components | `@rijkshuisstijl-community/components-react`, `components-css`, `design-tokens`, `font`                  |
| Styling    | Design tokens as CSS custom properties; local CSS modules for the few local components. Tailwind removed |
| Icons      | The icon component of the same library. `lucide-react` removed                                           |
| Tests      | Vitest (unchanged); Testing Library with jsdom for page behaviour; axe checks on each page               |

Versions come from npm under the existing 14-day cooldown in `.npmrc`; none are pinned in
this spec.

### Structure

```text
src/
  main.jsx                 router and root, imports the NLDS CSS and tokens
  routes.jsx               the route table above, with loaders
  api/
    client.js              fetch wrapper: base URL, Accept-Language, scenario header,
                           problem+json to ApiError (title, detail, burgerActie)
    wonen.js               one function per API resource
  pages/                   one file per page in the route table
  components/              ContentCard, DataList, EnergielabelSchaal, ContactCard,
                           FaqCard, PageTitle (breadcrumb or back link), LoadState,
                           ErrorState
  frame/                   StandInFrame, ScenarioSwitch, BuildLine (stand-in only)
  lib/                     buildInfo.js, siteInfo.js, format.js (Intl formatting only)
```

Removed: `App.jsx`, `PageHeader`, `PublicInfoSection`, `PersonalInfoSection`, `LoginPrompt`,
`RoofInsulationModal`, `DataStatus`, `useAuth`, `useProperty`, `useInsulationCalculation`,
`authService`, `propertyService`, `mockPropertyData`, `operatonService`, `insulationParams`,
and their tests. Their logic moves to `api/` (see below); their copy is reused where the new
pages need it.

### Rules for the front-end

- Data comes only from route loaders through `src/api/`. Pages receive what the API returns
  and render it; they choose layout, not content.
- `format.js` may format numbers, amounts and dates with `Intl` in `nl-NL`. It may not round
  to a different precision, add, compare or convert.
- Which links and buttons appear follows `acties` in the response. A page never shows an
  action the API did not offer.
- Every page sets `document.title` to `[Paginatitel] - MijnOverheid` and moves focus to the
  H1 after navigation.

## LVG API

### Principles

- Design first: `api/openapi.yaml` (OAS 3.0) is written and linted before the handlers. It is
  the source for the later API section of the functional design.
- The API is the only place for business rules and source integration: mock registers now,
  real sources later, and Operaton for the decision.
- Each resource returns what one page needs, already decided: statuses, outcomes, allowed
  actions and texts the citizen must see.

### Endpoints

| Method and path                            | Returns                                                                                               |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `GET /api/v1/openapi.json`                 | The contract (ADR requirement)                                                                        |
| `GET /api/v1/wonen`                        | Landing cards with their texts and links (`acties`)                                                   |
| `GET /api/v1/woningen`                     | `weergave` (`lijst`, `direct` or `leeg`), the properties (id, short address, kind, year, label class) |
| `GET /api/v1/woningen/{id}`                | The four summary sections, each with `status` (`beschikbaar`, `niet-beschikbaar`) and its fields      |
| `GET /api/v1/woningen/{id}/kadaster`       | Parcel data, map and photo links, product links, owner information link, contact                      |
| `GET /api/v1/woningen/{id}/woz`            | WOZ fields with their explanation texts, report link, contact                                         |
| `GET /api/v1/woningen/{id}/energielabel`   | Label class, `objectAanduiding`, dates, `geldigheid` status, ISDE link, contact, `acties`             |
| `GET /api/v1/woningen/{id}/dakisolatie`    | Current roof, options with final amounts, `aanbevolen` option, assumptions, sources, `acties`         |
| `GET /api/v1/woningen/{id}/aannemers`      | Contractors that may be offered, and the consent sets and durations for each                          |
| `POST /api/v1/woningen/{id}/toestemmingen` | Creates a mock consent: body has contractor, sets and duration. Returns 201 with kenmerk and validity |
| `GET /api/v1/toestemmingen/{kenmerk}`      | One consent, as shown on 8c                                                                           |

Every response carries `Content-Language: nl` and `API-Version`. Errors are
`application/problem+json` with `type`, `title`, `status`, `detail` and `burgerActie`.

Example: `GET /api/v1/woningen/{id}/dakisolatie` (abridged)

```json
{
  "woning": { "id": "w-7f3a", "adres": "Lange Hilleweg 73 B, 3073 BJ Rotterdam" },
  "huidigDak": {
    "isolatie": { "soort": "Glaswol", "dikteMm": 100, "rWaarde": 2.8 },
    "dakoppervlakteM2": 120,
    "daktype": "Zadeldak",
    "bronnen": ["Kadaster", "BAG", "LVG"]
  },
  "advies": {
    "status": "berekend",
    "berekendOp": "2026-11-19",
    "opties": [
      {
        "doelRWaarde": 6.0,
        "aanbevolen": true,
        "extraDikteMm": 112,
        "kostenEur": 4080,
        "kostenPerM2Eur": 34,
        "subsidieEur": 1000,
        "nettoKostenEur": 3080,
        "besparingPerJaarEur": 350,
        "terugverdientijdJaar": 8.8,
        "toelichting": "…"
      }
    ],
    "uitgangspunten": [{ "label": "Warmtegeleiding isolatiemateriaal", "waarde": "0,035 W/m·K" }]
  },
  "acties": [
    { "type": "deel-met-aannemer", "href": "/api/v1/woningen/w-7f3a/aannemers" },
    { "type": "meer-over-subsidie", "href": "https://www.rvo.nl/subsidies-financiering/isde" }
  ]
}
```

The amounts in this example are illustrative; the real values come from Operaton.

### Operaton

- `api/src/operaton/` holds the call to `bereken_isolatie_opties`, moved from
  `src/services/operatonService.js`. The cost parameters and target R-values move from
  `insulationParams.js` and `fetchAllCalculations` into `api/src/operaton/parameters.js`.
- The base URL is the app setting `OPERATON_BASE_URL`: `https://operaton.open-regels.nl/engine-rest`
  on Azure, `http://localhost:8081/engine-rest` locally with `OPERATON_USER` /
  `OPERATON_PASSWORD`. Credentials never leave the server side.
- The API rounds and maps the DMN outputs into the response. `kostenPerM2Eur` is computed in
  the API, not in the browser.
- The API takes `aanbevolen` from the DMN, not from its own rules (see below). If the deployed
  DMN lacks that output, no option is marked and the page shows the table without a
  highlighted advice. The API does not fall back to a rule of its own.
- Roof area comes from a roof field in the source data (`dak.oppervlakte_m2` in the mock), no
  longer from floor area.

### DMN `bereken_isolatie_opties`

The decision is deployed on Operaton (version 21 on `operaton.open-regels.nl` on 19 November
2026), but its source is not in any repository. It is a COLLECT decision table with four
rules, one per target R-value (3.0, 4.0, 6.0, 8.0), and ten outputs. Only the 6.0 rule has a
recommendation text.

- The source moves into this repository as `dmn/bereken_isolatie_opties.dmn`, taken from the
  deployed version through `GET /decision-definition/key/bereken_isolatie_opties/xml`.
- A new boolean output `aanbevolen` is added to every rule: `true` for the rule that carries
  the recommendation (6.0), `false` for the others. The decision key, inputs and existing
  outputs stay as they are, so the current front-end keeps working against the patched DMN.
- The patched DMN is deployed to local Operaton (`localhost:8081`) only. Deploying it to
  `operaton.open-regels.nl` is the owner's decision, made outside this plan; until then
  deployed sites show the advice without a highlighted option.
- Each rule uses a fixed subsidy and fixed annual saving, whatever the roof area. That is left
  as it is and recorded as an open question.

### Mock data and scenarios

- `api/src/mock/` holds the three scenarios. `drie-woningen` has the current Rotterdam property
  (with its building data, so the Operaton story works) plus the two other addresses from the
  design, with labels A and C. `een-woning` has only the Rotterdam property. `geen-woning` is
  empty. Mock ids are opaque.
- The design's second list entry is a "Huurwoning" with label G. Rental properties are out of
  scope, so it is not in the mock.
- Mock data is imported only by the API's source layer, so a real source replaces one module.

### Hosting and local development

- `api/` is a Node.js Azure Functions app (programming model v4) deployed as SWA managed
  functions, with `platform.apiRuntime: "node:22"` in `staticwebapp.config.json`. Managed
  functions do not run Node 24, so the API's code and tests must also pass on Node 22.
- The handlers are plain functions (`request → { status, headers, body }`) in `api/src/core/`.
  Thin adapters in `api/src/functions/` register them with Azure Functions. Tests call the
  core directly.
- Locally, a small Vite plugin mounts the same core handlers on `/api` in the dev server, so
  `npm run dev` runs front-end and API together without Azure Functions Core Tools. The SWA
  CLI is documented in the runbook as an optional check of the real runtime.
- The workflows build the API from its own lockfile (`npm ci` in `api/`), run its tests, and
  deploy it with `api_location: 'api'` and `skip_api_build: true`, so the lockfile decides
  what ships, as it already does for the front-end.
- The existing dev proxy to `localhost:8081` in `vite.config.js` is removed: the API calls
  Operaton directly.

## Accessibility and language

- WCAG 2.2 AA. Checked with axe in the page tests and by hand with keyboard and a screen
  reader, as described in the runbook.
- B1 Dutch for all copy written in this spec. Copy taken over from the designs is kept as is
  and marked for review by G&B.
- One H1 per page; card headings are H2, subsections H3.
- Tables have captions; data lists use description-list semantics; the energy label scale has
  a text equivalent (`Energielabel C`) and does not rely on colour.
- Visible focus, targets of at least 24 by 24 px, no information only in colour.

## Privacy and security

- No personal data in URLs, logs, `localStorage` or `sessionStorage`. Woning ids are opaque.
- The scenario header is ignored unless `LVG_SCENARIOS=on`.
- `dist/` contains no `localhost:8081`, `demo:demo` or Operaton URL (checked in CI with a
  search step).
- The mock consent stores nothing outside the API's memory for the life of the process.

## Testing and verification

| Area     | Evidence                                                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Contract | ADR linter passes on `api/openapi.yaml`. Every handler response in the tests validates against the contract                         |
| API      | Core handlers per resource and scenario; Operaton mapping with a mocked `fetch`; problem+json on Operaton failure; consent creation |
| Pages    | One test per page: renders the filled state from a fixture, the error state, and has no axe violations                              |
| Flows    | Single property redirects with history replace; consent button disabled until the box is ticked; refusing returns with the message  |
| Bundle   | No Operaton URL, `localhost:8081` or `demo:demo` in `dist/`                                                                         |
| By hand  | The owner completes Dakisolatie → aannemer → toestemming against local Operaton, then on the preview, desktop and mobile width      |

## Open questions

1. **Breadcrumb versus title.** Breadcrumbs say `Kadaster`, `WOZ` and `Energielabel`; titles
   say `Kadastrale gegevens`, `WOZ-gegevens`, `Energielabel`. Built as designed.
2. **Placeholders.** `{Ingang LVG}`, `{intro}`, `{intro, algemene informatie}`, the FAQ items
   (`Label`), contact details per organisation, and all info-button texts need copy from G&B.
3. **Energy label scale.** The design shows seven classes (A–G). Dutch dwelling labels run from
   A++++ to G. Built with seven blocks; a class above A shows as A with its full name in text.
4. **Kadaster links.** The five linked rights and mortgage items point to paid Kadaster
   products. Which URLs, and does the citizen leave MijnOverheid there?
5. **Consent direction.** The wireframes start at the contractor; this design starts in
   MijnOverheid. Does DvTP allow a citizen-initiated consent, and is MijnOverheid the right
   place for it, given that GBO names only the consent portal (S02)?
6. **Contractor list.** Which contractors may the government offer, in what order, and on
   what basis? Ratings are dropped.
7. **Fixed amounts in the DMN.** Subsidy and annual saving are fixed per rule, not derived
   from roof area or energy price. Should the DMN calculate them?
8. **Public Operaton.** When is the patched DMN deployed to `operaton.open-regels.nl`?
9. **Logius code conditions.** Framework, component library, packaging and CSP rules for
   front-end extensions are unknown until "Aansluitvoorwaarden MijnOverheid (code)" is in hand.
10. **Figma access.** The owner's account has view rights only. Editor access for
    steven.gort@ictu.nl lets later iterations read the frames directly.
11. **Desktop landing page.** The Figma export lacks it; the deck's version is used.
