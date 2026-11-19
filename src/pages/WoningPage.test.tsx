// @vitest-environment jsdom
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '../test/axe';
import { contractExample } from '../test/contractExamples';
import { renderPagina, verbodenFetch } from '../test/render';
import { WoningPage } from './WoningPage';

type Voorbeeld = Record<string, Record<string, unknown>>;
const voorbeeld = () => structuredClone(contractExample('getWoning', 200)) as Voorbeeld;

const toon = (data: unknown = voorbeeld()) =>
  renderPagina({
    patroon: '/nl/wonen/koopwoningen/:woningId',
    pad: '/nl/wonen/koopwoningen/w-7f3a',
    data,
    element: <WoningPage />,
  });

const sectie = (naam: string) => screen.getByRole('heading', { name: naam }).closest('section')!;

beforeEach(() => {
  vi.stubGlobal('fetch', verbodenFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('WoningPage', () => {
  it('is titled with the short address, under the list', async () => {
    toon();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Voorbeeldlaan 73 B' })
    ).toBeInTheDocument();
    const kruimelpad = screen.getByRole('navigation', { name: 'Kruimelpad' });
    expect(within(kruimelpad).getByRole('link', { name: 'Koopwoningen' })).toHaveAttribute(
      'href',
      '/nl/wonen/koopwoningen'
    );
  });

  it('shows the four sections with their data and links', async () => {
    toon();
    await screen.findByRole('heading', { level: 1 });

    const bag = sectie('Basisregistratie Adressen en Gebouwen (BAG)');
    expect(bag).toHaveTextContent('Bouwjaar1990');
    expect(bag).toHaveTextContent('Oppervlakte120 m²');
    expect(bag).toHaveTextContent('Verblijfsobject0599019999999999');

    const kadaster = sectie('Kadastrale gegevens');
    expect(kadaster).toHaveTextContent('Kadastrale grootte158 m²');
    expect(
      within(kadaster).getByRole('link', { name: /Bekijk kadastrale gegevens/ })
    ).toHaveAttribute('href', '/nl/wonen/koopwoningen/w-7f3a/kadaster');

    const woz = sectie('WOZ-gegevens');
    expect(woz).toHaveTextContent('WOZ-waarde€ 317.000');
    expect(woz).toHaveTextContent('Waardepeildatum1 januari 2025');
    expect(within(woz).getByRole('link', { name: /Bekijk WOZ-gegevens/ })).toHaveAttribute(
      'href',
      '/nl/wonen/koopwoningen/w-7f3a/woz'
    );

    const label = sectie('Energielabel');
    expect(within(label).getByText('Energielabel C')).toBeInTheDocument();
    expect(label).toHaveTextContent('Opnamedatum6 december 2020');
    expect(within(label).getByRole('link', { name: /Bekijk energielabel/ })).toHaveAttribute(
      'href',
      '/nl/wonen/koopwoningen/w-7f3a/energielabel'
    );
  });

  it('explains the WOZ values behind their info buttons', async () => {
    const user = userEvent.setup();
    toon();

    await user.click(await screen.findByRole('button', { name: 'Uitleg over WOZ-waarde' }));

    expect(
      screen.getByText('De waarde van uw woning volgens uw gemeente, op de waardepeildatum.')
    ).toBeVisible();
  });

  it('shows a short error line for a section whose source failed, and the others', async () => {
    const data = voorbeeld();
    data.woz = { status: 'niet-beschikbaar' };
    toon(data);
    await screen.findByRole('heading', { level: 1 });

    expect(sectie('WOZ-gegevens')).toHaveTextContent('Deze gegevens zijn nu niet beschikbaar.');
    expect(within(sectie('WOZ-gegevens')).queryByRole('link')).not.toBeInTheDocument();
    expect(sectie('Kadastrale gegevens')).toHaveTextContent('Rotterdam Z 99999');
  });

  it('shows the frequently asked questions, and has no axe violations', async () => {
    toon();

    expect(await screen.findByRole('heading', { name: 'Veelgestelde vragen' })).toBeInTheDocument();
    await expectNoAxeViolations(document.body);
  });
});
