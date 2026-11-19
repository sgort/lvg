// The error state of a card: the API's title and what the citizen can do, and a retry.
import { LuxAlert, LuxButton, LuxParagraph } from '@lux-design-system/components-react';

import styles from './ErrorState.module.scss';

type Props = {
  titel: string;
  burgerActie: string;
  opnieuwTekst?: string;
  onOpnieuw?: () => void;
};

export function ErrorState({ titel, burgerActie, opnieuwTekst, onOpnieuw }: Props) {
  return (
    <div className={styles.fout}>
      <LuxAlert type="error">
        <LuxParagraph>
          <strong>{titel}</strong>
        </LuxParagraph>
        <LuxParagraph>{burgerActie}</LuxParagraph>
      </LuxAlert>
      {opnieuwTekst && onOpnieuw && (
        <LuxButton type="button" appearance="secondary-action-button" onClick={onOpnieuw}>
          {opnieuwTekst}
        </LuxButton>
      )}
    </div>
  );
}
