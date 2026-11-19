import { describe, expect, it } from 'vitest';

import { NIET_BESCHIKBAAR_PAD, routeVoorActie } from './acties';

const context = { woningId: 'w-7f3a' };
const WONING = '/nl/wonen/koopwoningen/w-7f3a';

describe('routeVoorActie', () => {
  it.each([
    ['bekijk-koopwoningen', '/api/v1/woningen', '/nl/wonen/koopwoningen'],
    ['terug-naar-woning', '/api/v1/woningen/w-7f3a', WONING],
    ['bekijk-kadaster', '/api/v1/woningen/w-7f3a/kadaster', `${WONING}/kadaster`],
    ['bekijk-woz', '/api/v1/woningen/w-7f3a/woz', `${WONING}/woz`],
    ['bekijk-energielabel', '/api/v1/woningen/w-7f3a/energielabel', `${WONING}/energielabel`],
    [
      'bekijk-dakisolatie',
      '/api/v1/woningen/w-7f3a/dakisolatie',
      `${WONING}/energielabel/dakisolatie`,
    ],
    [
      'deel-met-aannemer',
      '/api/v1/woningen/w-7f3a/aannemers',
      `${WONING}/energielabel/dakisolatie/aannemer`,
    ],
  ])('maps %s to its page', (type, href, naar) => {
    expect(routeVoorActie({ type, href }, context)).toEqual({ naar });
  });

  it('opens an absolute https href as an external link', () => {
    const href = 'https://www.rvo.nl/subsidies-financiering/isde';

    expect(routeVoorActie({ type: 'meer-over-subsidie', href }, context)).toEqual({ extern: href });
  });

  it('sends a placeholder href to the "Nog niet beschikbaar" page', () => {
    const actie = { type: 'beheer-gegevens', href: '#nog-niet-beschikbaar' };

    expect(routeVoorActie(actie, context)).toEqual({ naar: NIET_BESCHIKBAAR_PAD });
  });

  it('shows no unknown action type', () => {
    expect(routeVoorActie({ type: 'iets-nieuws', href: '/api/v1/iets' }, context)).toBeNull();
  });

  it('shows no property action without a property', () => {
    expect(routeVoorActie({ type: 'bekijk-woz', href: '/api/v1/woningen/w-7f3a/woz' })).toBeNull();
  });
});
