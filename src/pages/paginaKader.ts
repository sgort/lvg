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
