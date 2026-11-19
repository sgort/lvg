// @vitest-environment jsdom
import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '../test/axe';
import { contractExample } from '../test/contractExamples';
import { renderPagina, verbodenFetch } from '../test/render';
import { KadasterPage } from './KadasterPage';

const toon = () =>
  renderPagina({
    patroon: '/nl/wonen/koopwoningen/:woningId/kadaster',
    pad: '/nl/wonen/koopwoningen/w-7f3a/kadaster',
    data: contractExample('getKadaster', 200),
    element: <KadasterPage />,
  });

// The page's sections are level-3 headings under the address (the H1 repeats one name).
const sectie = (naam: string) =>
  screen.getByRole('heading', { level: 3, name: naam }).closest('section')!;

beforeEach(() => {
  vi.stubGlobal('fetch', verbodenFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('KadasterPage', () => {
  it('is titled Kadastrale gegevens, with the address as subtitle and the way back', async () => {
    toon();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Kadastrale gegevens' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Voorbeeldlaan 73 B, 3000 SS Rotterdam' })
    ).toBeInTheDocument();
    const kruimelpad = screen.getByRole('navigation', { name: 'Kruimelpad' });
    expect(within(kruimelpad).getByRole('link', { name: 'Voorbeeldlaan 73 B' })).toHaveAttribute(
      'href',
      '/nl/wonen/koopwoningen/w-7f3a'
    );
  });

  it('shows the map with its download, and the parcel data with the paid products', async () => {
    toon();
    await screen.findByRole('heading', { level: 1 });

    expect(
      screen.getByRole('img', { name: 'Kadastrale kaart met perceel Rotterdam Z 99999' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Download kadastrale kaart \(png\)/ })).toHaveAttribute(
      'href',
      '/perceel-1560.png'
    );
    const gegevens = sectie('Kadastrale gegevens');
    expect(gegevens).toHaveTextContent('Koopsom€ 245.000');
    expect(gegevens).toHaveTextContent('Publiekrechtelijke beperkingenGeen');
    expect(within(gegevens).getAllByRole('link', { name: /Bestel bij het Kadaster/ })).toHaveLength(
      5
    );
  });

  it('links the owner information to the Kadaster, and its pdf to "Nog niet beschikbaar"', async () => {
    toon();
    await screen.findByRole('heading', { level: 1 });

    const info = sectie('Eigenaarsinformatie');
    expect(within(info).getByRole('link', { name: /^Kadaster/ })).toHaveAttribute(
      'href',
      'https://www.kadaster.nl/'
    );
    expect(
      within(info).getByRole('link', { name: /Download eigenaarsinformatie \(pdf\)/ })
    ).toHaveAttribute('href', '/nl/wonen/nog-niet-beschikbaar');
  });

  it('shows the photos open, the contact and the questions, without axe violations', async () => {
    toon();
    await screen.findByRole('heading', { level: 1 });

    expect(screen.getByRole('button', { name: "Luchtfoto's" })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByRole('img', { name: /Voorbeeld van een panoramafoto/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contactinformatie' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Veelgestelde vragen' })).toBeInTheDocument();
    await expectNoAxeViolations(document.body);
  });
});
