import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { socialMetaPlugin } from './socialMetaPlugin.js';

const INDEX = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const TITEL = 'Mijn woning – Wonen in MijnOverheid (prototype)';

const tagsVoor = (siteUrl) => {
  const { html, tags } = socialMetaPlugin(siteUrl).transformIndexHtml(INDEX);
  expect(html).toBe(INDEX);
  return tags;
};

// The content of the one meta tag with this property or name.
const waarde = (tags, sleutel) => {
  const gevonden = tags.filter(({ attrs }) => attrs.property === sleutel || attrs.name === sleutel);
  expect(gevonden, sleutel).toHaveLength(1);
  return gevonden[0].attrs.content;
};

const ALLE = [
  'description',
  'theme-color',
  'og:type',
  'og:locale',
  'og:site_name',
  'og:title',
  'og:description',
  'og:url',
  'og:image',
  'og:image:width',
  'og:image:height',
  'og:image:type',
  'og:image:alt',
  'twitter:card',
  'twitter:title',
  'twitter:description',
  'twitter:image',
  'twitter:image:alt',
];

describe('socialMetaPlugin', () => {
  it('gives acceptance its own card, URL and marked title', () => {
    const tags = tagsVoor('https://acc.lvg.open-regels.nl');

    expect(waarde(tags, 'og:image')).toBe('https://acc.lvg.open-regels.nl/og-image-acc.png');
    expect(waarde(tags, 'og:url')).toBe('https://acc.lvg.open-regels.nl/');
    expect(waarde(tags, 'og:title')).toBe(`ACC · ${TITEL}`);
  });

  it('gives the stable release the prod card and an unmarked title, trailing slash or not', () => {
    const tags = tagsVoor('https://lvg.open-regels.nl/');

    expect(waarde(tags, 'og:image')).toBe('https://lvg.open-regels.nl/og-image-prod.png');
    expect(waarde(tags, 'og:url')).toBe('https://lvg.open-regels.nl/');
    expect(waarde(tags, 'og:title')).toBe(TITEL);
  });

  it('falls back to the stable URL and the prod card in a local build', () => {
    const tags = tagsVoor(undefined);

    expect(waarde(tags, 'og:image')).toBe('https://lvg.open-regels.nl/og-image-prod.png');
    expect(waarde(tags, 'og:url')).toBe('https://lvg.open-regels.nl/');
    expect(waarde(tags, 'og:title')).toBe(`LOCAL · ${TITEL}`);
  });

  it('injects every tag once into the head, with the twitter values equal to og', () => {
    const tags = tagsVoor('https://acc.lvg.open-regels.nl');

    expect(tags).toHaveLength(ALLE.length);
    for (const sleutel of ALLE) waarde(tags, sleutel);
    expect(tags.every((tag) => tag.tag === 'meta' && tag.injectTo === 'head')).toBe(true);
    for (const deel of ['title', 'description', 'image', 'image:alt']) {
      expect(waarde(tags, `twitter:${deel}`)).toBe(waarde(tags, `og:${deel}`));
    }
    expect(waarde(tags, 'description')).toBe(waarde(tags, 'og:description'));
    expect(waarde(tags, 'og:description')).toBe(
      'Alles over uw woning op één plek: Kadaster, WOZ-waarde en energielabel. Met een berekend advies voor dakisolatie. Een prototype met voorbeeldgegevens.'
    );
    expect(waarde(tags, 'og:image:alt')).toBe(
      'Mijn woning: alles over uw woning op één plek. Prototype van Wonen in MijnOverheid.'
    );
    expect(waarde(tags, 'theme-color')).toBe('#154273');
    expect(waarde(tags, 'og:type')).toBe('website');
    expect(waarde(tags, 'og:locale')).toBe('nl_NL');
    expect(waarde(tags, 'og:site_name')).toBe('Mijn woning');
    expect(waarde(tags, 'og:image:width')).toBe('1200');
    expect(waarde(tags, 'og:image:height')).toBe('630');
    expect(waarde(tags, 'og:image:type')).toBe('image/png');
    expect(waarde(tags, 'twitter:card')).toBe('summary_large_image');
  });

  it('uses the same title as the browser tab', () => {
    expect(INDEX).toContain(`<title>${TITEL}</title>`);
  });

  it.each(['og-image-prod.png', 'og-image-acc.png'])('public/%s is a 1200×630 PNG', (naam) => {
    const png = readFileSync(new URL(`../public/${naam}`, import.meta.url));

    expect(png.subarray(1, 4).toString('latin1')).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
});
