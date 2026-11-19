// Shared copy for the top of a page: the breadcrumb label and the first steps of the path.
import { NIET_BESCHIKBAAR_PAD } from '../api/acties';
import type { Kruimel } from '../components/Breadcrumb';

export const KRUIMELPAD_LABEL = 'Kruimelpad';
export const WONEN_PAD = '/nl/wonen';
export const KOOPWONINGEN_PAD = '/nl/wonen/koopwoningen';

// MijnOverheid's own home page is outside these pages, so its step has no target here yet.
export const HOME: Kruimel = { tekst: 'Home', naar: NIET_BESCHIKBAAR_PAD };
export const WONEN: Kruimel = { tekst: 'Wonen', naar: WONEN_PAD };

/** The page of one property; the id is opaque, from the API. */
export const woningPad = (woningId: string) =>
  `${KOOPWONINGEN_PAD}/${encodeURIComponent(woningId)}`;

/** The breadcrumb to a property's page, and on to one of its detail pages. */
/** Where the property page's back link leads: the list, or Wonen when the list goes straight here. */
export const terugVanWoning = (woning: { overzicht?: 'lijst' | 'direct' }) =>
  woning.overzicht === 'direct'
    ? { tekst: 'Wonen', naar: WONEN_PAD }
    : { tekst: 'Koopwoningen', naar: KOOPWONINGEN_PAD };

export function kruimelsWoning(
  woning: { id: string; adresKort: string; overzicht?: 'lijst' | 'direct' },
  detailpagina?: string
): Kruimel[] {
  // With `direct` (from the API) the list only leads back here, so it is no step on the way.
  const pad =
    woning.overzicht === 'direct'
      ? [HOME, WONEN]
      : [HOME, WONEN, { tekst: 'Koopwoningen', naar: KOOPWONINGEN_PAD }];
  return detailpagina
    ? [...pad, { tekst: woning.adresKort, naar: woningPad(woning.id) }, { tekst: detailpagina }]
    : [...pad, { tekst: woning.adresKort }];
}
