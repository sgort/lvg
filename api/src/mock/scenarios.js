// Mock register data and the three development scenarios. Only api/src/sources imports
// this file, so a real source can replace one module at a time.
//
// The Rotterdam property and its building data come from the previous front-end mock, with a
// fictional street, postcode, BAG id, parcel and WOZ number since 19 November 2026 (#40).
// The other two addresses, and the WOZ and energy label values the Rotterdam property
// lacked, come from the G&B designs of 19 November 2026. Rental properties are out of
// scope and not mocked. Ids are opaque: they never contain an address or BAG id.

const woningen = {
  'w-7f3a': {
    bag: {
      straat: 'Voorbeeldlaan',
      huisnummer: '73 B',
      postcode: '3000 SS',
      woonplaats: 'Rotterdam',
      soort: 'Koopwoning',
      bouwjaar: 1990,
      gebruiksdoel: 'Woonfunctie',
      oppervlakteM2: 120,
      verblijfsobject: '0599019999999999',
      energielabelklasse: 'C',
    },
    kadaster: {
      aanduiding: 'Rotterdam Z 99999',
      grootteM2: 158,
      koopsomEur: 245000,
      publiekrechtelijkeBeperkingen: 'Geen',
      bebouwing: 'Woonhuis',
      kaart: '/perceel-1560.png',
      luchtfoto: '/luchtfoto-voorbeeld.svg',
      panoramafoto: '/panoramafoto-voorbeeld.svg',
    },
    woz: {
      waardeEur: 317000,
      waardepeildatum: '2025-01-01',
      grondoppervlakteM2: 160,
      objectnummer: '059999999999',
      objecttype: 'hoekwoning',
    },
    energielabel: {
      klasse: 'C',
      klasseNaam: 'C',
      gebouwklasse: 'woning',
      registratiedatum: '2021-02-04',
      opnamedatum: '2020-12-06',
      geldigTot: '2030-12-06',
    },
    gebouwgegevens: {
      gebouw: {
        gebouwtype: 'woonhuis',
        bouwjaar: 1990,
        vloeroppervlakte_m2: 120,
        bezettingspatroon: 'avonden_en_nachten',
      },
      dak: {
        daktype: 'zadeldak',
        // Roof area, separate from floor area since 19 November 2026. 120 keeps the
        // calculation comparable with the previous front-end.
        oppervlakte_m2: 120,
        dakhelling_graden: 30,
        dakbedekking_materiaal: 'bitumen_shingles',
        dakbeschot_materiaal: 'hout',
        dakconditie: 'goed',
      },
      bestaande_isolatie: {
        type: 'glaswol',
        dikte_mm: 100,
        R_waarde_m2K_per_W: 2.8,
        dampscherm_aanwezig: true,
        luchtlek_niveau: 'gemiddeld',
      },
    },
  },
  'w-2c91': {
    bag: {
      straat: 'Straatnaam',
      huisnummer: '23',
      postcode: '3311 AB',
      woonplaats: 'Drechtstad',
      soort: 'Koopwoning',
      bouwjaar: 1994,
      gebruiksdoel: 'Woonfunctie',
      oppervlakteM2: 104,
      verblijfsobject: '0505010000046271',
      energielabelklasse: 'A',
    },
    kadaster: {
      aanduiding: 'Drechtstad K 1182',
      grootteM2: 142,
      koopsomEur: 198000,
      publiekrechtelijkeBeperkingen: 'Geen',
      bebouwing: 'Woonhuis',
      kaart: '/perceel-1560.png',
      luchtfoto: '/luchtfoto-voorbeeld.svg',
      panoramafoto: '/panoramafoto-voorbeeld.svg',
    },
    woz: {
      waardeEur: 350000,
      waardepeildatum: '2025-01-01',
      grondoppervlakteM2: 160,
      objectnummer: '050500012345',
      objecttype: 'hoekwoning',
    },
    energielabel: {
      klasse: 'A',
      klasseNaam: 'A',
      gebouwklasse: 'woning',
      registratiedatum: '2021-02-04',
      opnamedatum: '2020-12-06',
      geldigTot: '2030-12-06',
    },
    gebouwgegevens: null,
  },
  'w-b04e': {
    bag: {
      straat: 'Regenboogweg',
      huisnummer: '9',
      postcode: '6961 LL',
      woonplaats: 'Nintendorp',
      soort: 'Koopwoning',
      bouwjaar: 1967,
      gebruiksdoel: 'Woonfunctie',
      oppervlakteM2: 131,
      verblijfsobject: '1945010000077514',
      energielabelklasse: 'C',
    },
    kadaster: {
      aanduiding: 'Nintendorp B 2207',
      grootteM2: 210,
      koopsomEur: 162000,
      publiekrechtelijkeBeperkingen: 'Geen',
      bebouwing: 'Woonhuis',
      kaart: '/perceel-1560.png',
      luchtfoto: '/luchtfoto-voorbeeld.svg',
      panoramafoto: '/panoramafoto-voorbeeld.svg',
    },
    woz: {
      waardeEur: 289000,
      waardepeildatum: '2025-01-01',
      grondoppervlakteM2: 210,
      objectnummer: '194500067890',
      objecttype: 'tussenwoning',
    },
    energielabel: {
      klasse: 'C',
      klasseNaam: 'C',
      gebouwklasse: 'woning',
      registratiedatum: '2019-05-17',
      opnamedatum: '2019-04-30',
      geldigTot: '2029-04-30',
    },
    gebouwgegevens: null,
  },
};

const aannemers = [
  { id: 'a-91d2', naam: 'IsolatieGroep Rotterdam', specialisme: 'Dakisolatie specialist' },
  { id: 'a-4e07', naam: 'EcoTherm Isolatie', specialisme: 'Duurzame isolatie' },
  { id: 'a-c3b8', naam: 'DakTotaal B.V.', specialisme: 'Complete dakoplossingen' },
  { id: 'a-17fa', naam: 'WarmteWerken', specialisme: 'Energiebesparing' },
  { id: 'a-6d53', naam: 'IsolatieXpert', specialisme: 'Snelle service' },
  { id: 'a-a820', naam: 'GreenRoof Solutions', specialisme: 'Groene daken & isolatie' },
];

/** Which properties each simulated citizen owns. */
export const scenarios = {
  'geen-woning': [],
  'een-woning': ['w-7f3a'],
  'drie-woningen': ['w-7f3a', 'w-2c91', 'w-b04e'],
};

export const mock = { woningen, aannemers };
