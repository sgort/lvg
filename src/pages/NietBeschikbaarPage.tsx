// "Nog niet beschikbaar": where links go whose target G&B has not delivered yet, and the
// routes whose pages are built in later tasks.
import { LuxParagraph } from '@lux-design-system/components-react';

import { ContentCard } from '../components/ContentCard';
import { Koppeling } from '../components/Koppeling';
import { PageTitle } from '../components/PageTitle';
import { HOME, KRUIMELPAD_LABEL, WONEN, WONEN_PAD } from './paginaKader';

const TITEL = 'Nog niet beschikbaar';

export function NietBeschikbaarPage() {
  return (
    <>
      <PageTitle
        titel={TITEL}
        kruimelpad={{ label: KRUIMELPAD_LABEL, items: [HOME, WONEN, { tekst: TITEL }] }}
        terug={{ tekst: 'Wonen', naar: WONEN_PAD }}
      />
      <ContentCard>
        <LuxParagraph>Deze pagina is nog in ontwikkeling.</LuxParagraph>
        <LuxParagraph>
          <Koppeling doel={{ naar: WONEN_PAD }} pijl>
            Naar Wonen
          </Koppeling>
        </LuxParagraph>
      </ContentCard>
    </>
  );
}
