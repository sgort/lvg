// zod schemas for every response of the LVG API, mirroring api/openapi.yaml: the same
// required fields and enums. Unknown fields are dropped, not refused, so additions the
// version policy allows do not break the pages. Every response is parsed before use.
import { z } from 'zod';

const datum = z.iso.date();
const geheel = z.number().int();

export const Probleem = z.object({
  type: z.string(),
  title: z.string(),
  status: geheel,
  detail: z.string().optional(),
  instance: z.string().optional(),
  burgerActie: z.string(),
});
export type Probleem = z.infer<typeof Probleem>;

export const Actie = z.object({
  type: z.string(),
  href: z.string(),
  tekst: z.string().optional(),
});
export type Actie = z.infer<typeof Actie>;

export const Link = z.object({
  tekst: z.string(),
  href: z.string(),
  extern: z.boolean().optional(),
});
export type Link = z.infer<typeof Link>;

export const Afbeelding = z.object({ src: z.string(), alt: z.string() });
export type Afbeelding = z.infer<typeof Afbeelding>;

export const Contact = z.object({
  organisatie: z.string(),
  website: Link.optional(),
  email: z.email().optional(),
});
export type Contact = z.infer<typeof Contact>;

export const VeelgesteldeVragen = z.object({
  vragen: z.array(z.object({ vraag: z.string(), antwoord: z.string() })),
  meer: Link.optional(),
});
export type VeelgesteldeVragen = z.infer<typeof VeelgesteldeVragen>;

export const WoningVerwijzing = z.object({
  id: z.string(),
  adresKort: z.string(),
  adres: z.string(),
});
export type WoningVerwijzing = z.infer<typeof WoningVerwijzing>;

export const Energielabelklasse = z.object({
  klasse: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']),
  naam: z.string(),
});
export type Energielabelklasse = z.infer<typeof Energielabelklasse>;

const BedragMetUitleg = z.object({ bedragEur: z.number(), uitleg: z.string().optional() });
const DatumMetUitleg = z.object({ datum, uitleg: z.string().optional() });
const TekstMetUitleg = z.object({ tekst: z.string(), uitleg: z.string().optional() });
const LinkMetUitleg = z.object({ link: Link, uitleg: z.string().optional() });

export const SectieStatus = z.enum(['beschikbaar', 'niet-beschikbaar']);
export type SectieStatus = z.infer<typeof SectieStatus>;

// GET /wonen
export const Wonen = z.object({
  kaarten: z.array(
    z.object({
      id: z.string(),
      titel: z.string(),
      bron: z.string(),
      tekst: z.string(),
      actie: Actie,
    })
  ),
});
export type Wonen = z.infer<typeof Wonen>;

// GET /woningen
export const WoningInLijst = z.object({
  id: z.string(),
  adresKort: z.string(),
  adresMetPlaats: z.string(),
  soort: z.string(),
  bouwjaar: geheel,
  energielabel: Energielabelklasse.optional(),
});
export type WoningInLijst = z.infer<typeof WoningInLijst>;

export const WoningenOverzicht = z.object({
  weergave: z.enum(['lijst', 'direct', 'leeg']),
  woningen: z.array(WoningInLijst),
  acties: z.array(Actie),
  veelgesteldeVragen: VeelgesteldeVragen.optional(),
});
export type WoningenOverzicht = z.infer<typeof WoningenOverzicht>;

// GET /woningen/{id}: every section carries its own status.
export const Woning = z.object({
  woning: WoningVerwijzing,
  bag: z.object({
    status: SectieStatus,
    adres: z.string().optional(),
    bouwjaar: geheel.optional(),
    gebruiksdoel: z.string().optional(),
    oppervlakteM2: z.number().optional(),
    verblijfsobject: z.string().optional(),
  }),
  kadaster: z.object({
    status: SectieStatus,
    aanduiding: z.string().optional(),
    grootteM2: z.number().optional(),
    actie: Actie.optional(),
  }),
  woz: z.object({
    status: SectieStatus,
    waarde: BedragMetUitleg.optional(),
    waardepeildatum: DatumMetUitleg.optional(),
    actie: Actie.optional(),
  }),
  energielabel: z.object({
    status: SectieStatus,
    label: Energielabelklasse.optional(),
    opnamedatum: datum.optional(),
    actie: Actie.optional(),
  }),
  veelgesteldeVragen: VeelgesteldeVragen.optional(),
});
export type Woning = z.infer<typeof Woning>;

// GET /woningen/{id}/kadaster
export const Kadaster = z.object({
  woning: WoningVerwijzing,
  kaart: z.object({ afbeelding: Afbeelding, download: Link.optional() }),
  gegevens: z.object({
    aanduiding: z.string(),
    grootteM2: z.number(),
    koopsomEur: z.number().optional(),
    publiekrechtelijkeBeperkingen: z.string().optional(),
    bebouwing: z.string().optional(),
  }),
  producten: z.array(z.object({ label: z.string(), link: Link })),
  eigenaarsinformatie: z.object({
    tekst: z.string(),
    meerInformatie: Link,
    download: Link.optional(),
  }),
  fotos: z.object({ luchtfotos: z.array(Afbeelding), panoramafotos: z.array(Afbeelding) }),
  contact: Contact,
  veelgesteldeVragen: VeelgesteldeVragen.optional(),
});
export type Kadaster = z.infer<typeof Kadaster>;

// GET /woningen/{id}/woz
export const Woz = z.object({
  woning: WoningVerwijzing,
  gegevens: z.object({
    waarde: BedragMetUitleg,
    waardepeildatum: DatumMetUitleg,
    grondoppervlakteM2: z.object({ waarde: z.number(), uitleg: z.string().optional() }).optional(),
    objectnummer: TekstMetUitleg.optional(),
    objecttype: TekstMetUitleg.optional(),
    taxatieverslag: LinkMetUitleg.optional(),
  }),
  contact: Contact,
  veelgesteldeVragen: VeelgesteldeVragen.optional(),
});
export type Woz = z.infer<typeof Woz>;

// GET /woningen/{id}/energielabel
export const Energielabel = z.object({
  woning: WoningVerwijzing,
  label: Energielabelklasse,
  objectAanduiding: z.enum(['woning', 'gebouw']),
  registratiedatum: datum,
  opnamedatum: datum,
  geldigTot: datum,
  geldigheid: z.enum(['geldig', 'verlopen']),
  labelDocument: Link.optional(),
  opnamegegevens: Link.optional(),
  isde: LinkMetUitleg.optional(),
  contact: Contact.optional(),
  veelgesteldeVragen: VeelgesteldeVragen.optional(),
  acties: z.array(Actie),
});
export type Energielabel = z.infer<typeof Energielabel>;

// GET /woningen/{id}/dakisolatie
export const Isolatieoptie = z.object({
  doelRWaarde: z.number(),
  aanbevolen: z.boolean(),
  extraDikteMm: z.number(),
  kostenEur: z.number(),
  kostenPerM2Eur: z.number(),
  subsidieEur: z.number(),
  nettoKostenEur: z.number(),
  besparingPerJaarEur: z.number(),
  terugverdientijdJaar: z.number(),
  toelichting: z.string().optional(),
});
export type Isolatieoptie = z.infer<typeof Isolatieoptie>;

export const AdviesBerekend = z.object({
  status: z.literal('berekend'),
  berekendOp: datum,
  opties: z.array(Isolatieoptie),
  uitgangspunten: z.array(z.object({ label: z.string(), waarde: z.string() })),
  toelichting: z.string().optional(),
});
export type AdviesBerekend = z.infer<typeof AdviesBerekend>;

export const AdviesNietBeschikbaar = z.object({
  status: z.literal('niet-beschikbaar'),
  melding: Probleem,
});
export type AdviesNietBeschikbaar = z.infer<typeof AdviesNietBeschikbaar>;

export const Advies = z.discriminatedUnion('status', [AdviesBerekend, AdviesNietBeschikbaar]);
export type Advies = z.infer<typeof Advies>;

export const Dakisolatie = z.object({
  woning: WoningVerwijzing,
  huidigDak: z.object({
    isolatie: z.object({ soort: z.string(), dikteMm: z.number(), rWaarde: z.number() }),
    dakoppervlakteM2: z.number(),
    daktype: z.string(),
    bronnen: z.array(z.string()),
    klopDitNiet: Link.optional(),
  }),
  advies: Advies,
  contact: Contact.optional(),
  veelgesteldeVragen: VeelgesteldeVragen.optional(),
  acties: z.array(Actie),
});
export type Dakisolatie = z.infer<typeof Dakisolatie>;

// GET /woningen/{id}/aannemers
export const Gegevensset = z.object({
  id: z.string(),
  naam: z.string(),
  bron: z.string(),
  elementen: z.array(z.string()),
  verplicht: z.boolean(),
  standaardAan: z.boolean(),
});
export type Gegevensset = z.infer<typeof Gegevensset>;

export const Termijn = z.object({ dagen: geheel, verlooptOp: datum, standaard: z.boolean() });
export type Termijn = z.infer<typeof Termijn>;

export const Aannemer = z.object({
  id: z.string(),
  naam: z.string(),
  specialisme: z.string(),
  gegevenssets: z.array(Gegevensset),
  termijnen: z.array(Termijn),
});
export type Aannemer = z.infer<typeof Aannemer>;

export const AannemersOverzicht = z.object({
  woning: WoningVerwijzing,
  doel: z.string(),
  aannemers: z.array(Aannemer),
});
export type AannemersOverzicht = z.infer<typeof AannemersOverzicht>;

// POST /woningen/{id}/toestemmingen and GET /toestemmingen/{kenmerk}
export type ToestemmingAanvraag = {
  aannemerId: string;
  gegevenssets: string[];
  termijnDagen: number;
};

export const Toestemming = z.object({
  kenmerk: z.string(),
  woning: WoningVerwijzing,
  gedeeldMet: z.string(),
  doel: z.string(),
  gegevenssets: z.array(z.string()),
  geldigTot: datum,
  termijnDagen: geheel,
  acties: z.array(Actie),
});
export type Toestemming = z.infer<typeof Toestemming>;
