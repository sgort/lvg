// "Pagina niet gevonden" for an unknown path, or "Deze woning is niet gevonden" when the API
// does not know the property (or it is not the citizen's).
import { LuxParagraph } from '@lux-design-system/components-react';

import { ContentCard } from '../components/ContentCard';
import { ChevronRechts } from '../components/icons';
import { LinkNaar } from '../components/LinkNaar';
import { PageTitle } from '../components/PageTitle';
import { HOME, KOOPWONINGEN_PAD, KRUIMELPAD_LABEL, WONEN, WONEN_PAD } from './paginaKader';

const SOORTEN = {
  pagina: {
    titel: 'Pagina niet gevonden',
    tekst: 'Deze pagina bestaat niet (meer).',
    link: { tekst: 'Naar Wonen', naar: WONEN_PAD },
    terug: { tekst: 'Home', naar: HOME.naar ?? WONEN_PAD },
  },
  woning: {
    titel: 'Deze woning is niet gevonden',
    tekst: 'Deze woning bestaat niet, of staat niet op uw naam.',
    link: { tekst: 'Naar Koopwoningen', naar: KOOPWONINGEN_PAD },
    terug: { tekst: 'Koopwoningen', naar: KOOPWONINGEN_PAD },
  },
} as const;

export function NietGevondenPage({ soort = 'pagina' }: { soort?: keyof typeof SOORTEN }) {
  const pagina = SOORTEN[soort];
  const kruimels =
    soort === 'woning'
      ? [HOME, WONEN, { tekst: 'Koopwoningen', naar: KOOPWONINGEN_PAD }, { tekst: pagina.titel }]
      : [HOME, { tekst: pagina.titel }];
  return (
    <>
      <PageTitle
        titel={pagina.titel}
        kruimelpad={{ label: KRUIMELPAD_LABEL, items: kruimels }}
        terug={pagina.terug}
      />
      <ContentCard>
        <LuxParagraph>{pagina.tekst}</LuxParagraph>
        <LuxParagraph>
          <LinkNaar naar={pagina.link.naar} icon={<ChevronRechts />} iconPosition="end">
            {pagina.link.tekst}
          </LinkNaar>
        </LuxParagraph>
      </ContentCard>
    </>
  );
}
