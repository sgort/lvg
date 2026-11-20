// Mock copy for the places where the design still had placeholders: card texts, explanations
// behind the info buttons, and link texts. Written for this sandbox in B1 Dutch; not reviewed
// by G&B or the source holders. Owner's decision of 19 November 2026 (plan Task 22).

export const WONEN_KAARTEN = {
  woningeigenaar:
    'Bekijk de gegevens van uw koopwoning: de kadastrale gegevens, de WOZ-waarde en het energielabel. U ziet ook wat betere dakisolatie kost en oplevert.',
  huurder:
    'Huurt u een woning? Hier vindt u straks de gegevens over uw huurwoning en over huurtoeslag.',
};

export const WOZ_UITLEG = {
  waarde: 'De waarde van uw woning volgens uw gemeente, op de waardepeildatum.',
  waardepeildatum: 'De datum waarop de gemeente de waarde van uw woning heeft bepaald.',
  grondoppervlakte: 'De grootte van de grond die bij uw woning hoort.',
  objectnummer: 'Het nummer waarmee de gemeente uw woning in de WOZ-registratie bijhoudt.',
  objecttype: 'Het soort woning volgens de WOZ-registratie.',
  taxatieverslag:
    'In het taxatieverslag leest u hoe de gemeente de waarde van uw woning heeft bepaald.',
};

export const ISDE = {
  tekst: 'Bekijk uw ISDE-gegevens',
  uitleg:
    'ISDE is een subsidie voor isolatie, warmtepompen en zonneboilers. Hier ziet u welke ISDE-subsidie u eerder voor deze woning hebt gekregen.',
};

// Kadaster products that cost money; the link leads to the Kadaster's website.
export const KADASTER_PRODUCTEN = [
  'Beperkte rechten',
  'Hypotheekbedrag',
  'Hypotheekgever',
  'Hypotheeknemer',
  'Zakelijke rechten',
];
export const KADASTER_PRODUCT_LINK = 'Bestel bij het Kadaster';

// Websites of the municipalities that value the mock properties; the fictional towns have none.
export const GEMEENTE_WEBSITES = {
  Rotterdam: { tekst: 'www.rotterdam.nl', href: 'https://www.rotterdam.nl/' },
};

export const LVG_WEBSITE = { tekst: 'lvg.open-regels.nl', href: 'https://lvg.open-regels.nl/' };
