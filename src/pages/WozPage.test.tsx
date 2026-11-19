// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '../test/axe';
import { contractExample } from '../test/contractExamples';
import { renderPagina, verbodenFetch } from '../test/render';
import { WozPage } from './WozPage';

const toon = () =>
  renderPagina({
    patroon: '/nl/wonen/koopwoningen/:woningId/woz',
    pad: '/nl/wonen/koopwoningen/w-7f3a/woz',
    data: contractExample('getWoz', 200),
    element: <WozPage />,
  });

beforeEach(() => {
  vi.stubGlobal('fetch', verbodenFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('WozPage', () => {
  it('shows every WOZ field', async () => {
    toon();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'WOZ-gegevens' })
    ).toBeInTheDocument();
    const lijst = document.querySelector('dl')!;
    expect(lijst).toHaveTextContent('WOZ-waarde€ 317.000');
    expect(lijst).toHaveTextContent('Waardepeildatum1 januari 2025');
    expect(lijst).toHaveTextContent('Grondoppervlakte160 m²');
    expect(lijst).toHaveTextContent('WOZ-objectnummer059999999999');
    expect(lijst).toHaveTextContent('WOZ-objecttypehoekwoning');
  });

  it('gives every field an info button with the explanation from the API', async () => {
    const user = userEvent.setup();
    toon();
    await screen.findByRole('heading', { level: 1 });

    expect(screen.getAllByRole('button', { name: /^Uitleg over/ })).toHaveLength(6);
    await user.click(screen.getByRole('button', { name: 'Uitleg over WOZ-objecttype' }));
    expect(screen.getByText('Het soort woning volgens de WOZ-registratie.')).toBeVisible();
  });

  it('sends the report link, a placeholder, to "Nog niet beschikbaar"', async () => {
    toon();

    expect(await screen.findByRole('link', { name: /Taxatieverslag \(pdf\)/ })).toHaveAttribute(
      'href',
      '/nl/wonen/nog-niet-beschikbaar'
    );
  });

  it('shows the municipality as contact, and has no axe violations', async () => {
    toon();

    expect(await screen.findByText('Gemeente Rotterdam')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /www\.rotterdam\.nl/ })).toHaveAttribute(
      'href',
      'https://www.rotterdam.nl/'
    );
    await expectNoAxeViolations(document.body);
  });
});
