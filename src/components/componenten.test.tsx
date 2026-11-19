// @vitest-environment jsdom
// The shared UI components: each renders from its props alone (fetch fails the test), takes
// all its text as props, and has no axe violations.
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '../test/axe';
import { renderMetRouter, verbodenFetch } from '../test/render';
import { Breadcrumb } from './Breadcrumb';
import { ContactCard } from './ContactCard';
import { ContentCard } from './ContentCard';
import { DataList } from './DataList';
import { EnergielabelSchaal } from './EnergielabelSchaal';
import { ErrorState } from './ErrorState';
import { FaqCard } from './FaqCard';
import { InfoToggle } from './InfoToggle';
import { Koppeling } from './Koppeling';
import { LabelTegel } from './LabelTegel';
import { LoadState } from './LoadState';
import { PageTitle } from './PageTitle';
import { Tabel } from './Tabel';

beforeEach(() => {
  vi.stubGlobal('fetch', verbodenFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ContentCard', () => {
  it('renders its title as a heading and its content', async () => {
    const { container } = render(
      <ContentCard titel="Gegevens">
        <p>Inhoud</p>
      </ContentCard>
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Gegevens' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Gegevens' })).toHaveTextContent('Inhoud');
    await expectNoAxeViolations(container);
  });
});

describe('DataList', () => {
  it('renders labels and values as a description list', async () => {
    const { container } = render(
      <DataList
        items={[
          { label: 'Bouwjaar', waarde: '1990' },
          { label: 'Oppervlakte', waarde: '120 m²' },
        ]}
      />
    );

    const termen = container.querySelectorAll('dt');
    expect([...termen].map((dt) => dt.textContent)).toEqual(['Bouwjaar', 'Oppervlakte']);
    expect(container.querySelector('dd')).toHaveTextContent('1990');
    await expectNoAxeViolations(container);
  });
});

describe('Breadcrumb', () => {
  it('links every step but the current page', async () => {
    const { container } = renderMetRouter(
      <Breadcrumb
        label="Kruimelpad"
        items={[{ tekst: 'Wonen', naar: '/nl/wonen' }, { tekst: 'Koopwoningen' }]}
      />
    );

    const nav = screen.getByRole('navigation', { name: 'Kruimelpad' });
    expect(within(nav).getByRole('link', { name: 'Wonen' })).toHaveAttribute('href', '/nl/wonen');
    expect(within(nav).getByText('Koopwoningen')).toHaveAttribute('aria-current', 'page');
    await expectNoAxeViolations(container);
  });
});

describe('PageTitle', () => {
  const props = {
    titel: 'Koopwoningen',
    kruimelpad: {
      label: 'Kruimelpad',
      items: [{ tekst: 'Wonen', naar: '/nl/wonen' }, { tekst: 'Koopwoningen' }],
    },
    terug: { tekst: 'Wonen', naar: '/nl/wonen' },
  };

  it('renders the H1, the breadcrumb and the back link', async () => {
    const { container } = renderMetRouter(<PageTitle {...props} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Koopwoningen' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Kruimelpad' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Wonen/ })).toHaveLength(2);
    await expectNoAxeViolations(container);
  });

  it('sets the document title and moves focus to the H1', () => {
    renderMetRouter(<PageTitle {...props} />);

    expect(document.title).toBe('Koopwoningen - MijnOverheid');
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
  });
});

describe('InfoToggle', () => {
  it('shows its explanation when opened', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <InfoToggle label="Uitleg over de WOZ-waarde" tekst="De waarde op de peildatum." />
    );
    const knop = screen.getByRole('button', { name: 'Uitleg over de WOZ-waarde' });

    expect(knop).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('De waarde op de peildatum.')).not.toBeVisible();

    await user.click(knop);

    expect(knop).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('De waarde op de peildatum.')).toBeVisible();
    await expectNoAxeViolations(container);
  });
});

describe('EnergielabelSchaal', () => {
  it('shows seven blocks, hidden from screen readers, and names the label in text', async () => {
    const { container } = render(
      <EnergielabelSchaal tekst="Energielabel" label={{ klasse: 'C', naam: 'C' }} />
    );

    const schaal = container.querySelector('[aria-hidden="true"]');
    expect(schaal?.children).toHaveLength(7);
    expect(screen.getByText('Energielabel C')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('uses the label name, such as A++', () => {
    render(<EnergielabelSchaal tekst="Energielabel" label={{ klasse: 'A', naam: 'A++' }} />);

    expect(screen.getByText('Energielabel A++')).toBeInTheDocument();
  });
});

describe('LabelTegel', () => {
  it('shows the letter on its colour and names the label in text', async () => {
    const { container } = render(
      <LabelTegel tekst="Energielabel" label={{ klasse: 'C', naam: 'C' }} />
    );

    expect(screen.getByText('Energielabel C')).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('C');
    await expectNoAxeViolations(container);
  });
});

describe('Koppeling', () => {
  it('opens an external target as an external link', () => {
    renderMetRouter(<Koppeling doel={{ extern: 'https://www.rvo.nl/' }}>RVO</Koppeling>);

    expect(screen.getByRole('link', { name: /RVO/ })).toHaveAttribute(
      'href',
      'https://www.rvo.nl/'
    );
  });

  it('puts the chevron of a "Bekijk … ›" link after the text, in bold', () => {
    renderMetRouter(
      <Koppeling doel={{ naar: '/nl/wonen' }} pijl>
        Bekijk koopwoningen
      </Koppeling>
    );

    // LuxLink keeps the icon first in the DOM and moves it after the text with this class.
    const link = screen.getByRole('link', { name: 'Bekijk koopwoningen' });
    expect(link.querySelector('svg')).toHaveClass('lux-link-icon--end');
    expect(link.className).toMatch(/pijl/);
  });

  it('links a route through the router', () => {
    renderMetRouter(<Koppeling doel={{ naar: '/nl/wonen' }}>Wonen</Koppeling>);

    expect(screen.getByRole('link', { name: 'Wonen' })).toHaveAttribute('href', '/nl/wonen');
  });
});

describe('ContactCard', () => {
  it('shows the organisation, its website and its e-mail address', async () => {
    const { container } = renderMetRouter(
      <ContactCard
        titel="Contactinformatie"
        organisatie="Kadaster"
        website={{ tekst: 'kadaster.nl', doel: { extern: 'https://www.kadaster.nl/' } }}
        email="info@kadaster.nl"
      />
    );

    expect(screen.getByRole('heading', { name: 'Contactinformatie' })).toBeInTheDocument();
    expect(screen.getByText('Kadaster')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^kadaster\.nl/ })).toHaveAttribute(
      'href',
      'https://www.kadaster.nl/'
    );
    expect(screen.getByRole('link', { name: 'info@kadaster.nl' })).toHaveAttribute(
      'href',
      'mailto:info@kadaster.nl'
    );
    await expectNoAxeViolations(container);
  });
});

describe('FaqCard', () => {
  it('shows the questions collapsed and a link to all questions', async () => {
    const { container } = renderMetRouter(
      <FaqCard
        titel="Veelgestelde vragen"
        vragen={[
          { vraag: 'Wat is de WOZ-waarde?', antwoord: 'De waarde van uw woning.' },
          { vraag: 'Kan ik bezwaar maken?', antwoord: 'Ja, binnen zes weken.' },
        ]}
        meer={{ tekst: 'Bekijk alle veelgestelde vragen', doel: { naar: '/nl/wonen' } }}
      />
    );

    const vraag = screen.getByRole('button', { name: 'Wat is de WOZ-waarde?' });
    expect(vraag).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.getByRole('link', { name: /Bekijk alle veelgestelde vragen/ })
    ).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});

describe('Tabel', () => {
  it('renders a table with a caption and row headers', async () => {
    const { container } = render(
      <Tabel
        caption="Alle opties"
        kolommen={['Doel', 'Kosten']}
        rijen={[
          { sleutel: 'r3', kop: 'R 3', cellen: ['€ 277'] },
          { sleutel: 'r6', kop: 'R 6', cellen: ['€ 4.435'] },
        ]}
      />
    );

    const tabel = screen.getByRole('table', { name: 'Alle opties' });
    expect(within(tabel).getByRole('rowheader', { name: 'R 6' })).toBeInTheDocument();
    expect(
      within(tabel)
        .getAllByRole('columnheader')
        .map((th) => th.textContent)
    ).toEqual(['Doel', 'Kosten']);
    await expectNoAxeViolations(container);
  });
});

describe('LoadState', () => {
  it('says the data is loading and marks itself busy', async () => {
    const { container } = render(<LoadState tekst="Gegevens laden…" />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Gegevens laden…')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});

describe('ErrorState', () => {
  it("shows the API's title and next step, and offers a retry", async () => {
    const user = userEvent.setup();
    const opnieuw = vi.fn();
    const { container } = render(
      <ErrorState
        titel="Er ging iets mis"
        burgerActie="Probeer het later opnieuw."
        opnieuwTekst="Probeer opnieuw"
        onOpnieuw={opnieuw}
      />
    );

    expect(screen.getByText('Er ging iets mis')).toBeInTheDocument();
    expect(screen.getByText('Probeer het later opnieuw.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Probeer opnieuw' }));
    expect(opnieuw).toHaveBeenCalledOnce();
    await expectNoAxeViolations(container);
  });
});
