// The landing page's cards: title, source, text and the button to where the card leads.
// Takes resolved data and copy; decides nothing about which cards appear.
import { LuxParagraph } from '@lux-design-system/components-react';

import { ContentCard } from '../../components/ContentCard';
import { type Doel, Koppeling } from '../../components/Koppeling';
import styles from './WonenKaarten.module.scss';

export type WonenKaart = {
  id: string;
  titel: string;
  bron: string;
  tekst: string;
  knop?: { tekst: string; doel: Doel };
};

export function WonenKaarten({ kaarten }: { kaarten: WonenKaart[] }) {
  return (
    <div className={styles.raster}>
      {kaarten.map((kaart) => (
        <ContentCard key={kaart.id} titel={kaart.titel}>
          <LuxParagraph>
            <strong>{kaart.bron}</strong>
          </LuxParagraph>
          <LuxParagraph>{kaart.tekst}</LuxParagraph>
          {kaart.knop && (
            <LuxParagraph className={styles.knop}>
              <Koppeling doel={kaart.knop.doel} pijl>
                {kaart.knop.tekst}
              </Koppeling>
            </LuxParagraph>
          )}
        </ContentCard>
      ))}
    </div>
  );
}
