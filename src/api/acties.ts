// Presentation only: which page an action type opens. Whether an action is offered at all is
// the API's decision (its `acties`); this table decides nothing about that.
import type { Actie } from './schemas';

/** The page for links whose target G&B has not delivered yet. */
export const NIET_BESCHIKBAAR_PAD = '/nl/wonen/nog-niet-beschikbaar';
const PLACEHOLDER_HREF = '#nog-niet-beschikbaar';

const KOOPWONINGEN = '/nl/wonen/koopwoningen';

export type Bestemming = { naar: string } | { extern: string };
export type ActieContext = { woningId?: string };

// Routes per action type; those that need a property get its id from the page's context.
const ROUTES: Record<string, (woning: string) => string> = {
  'terug-naar-woning': (woning) => woning,
  'bekijk-kadaster': (woning) => `${woning}/kadaster`,
  'bekijk-woz': (woning) => `${woning}/woz`,
  'bekijk-energielabel': (woning) => `${woning}/energielabel`,
  'bekijk-dakisolatie': (woning) => `${woning}/energielabel/dakisolatie`,
  'deel-met-aannemer': (woning) => `${woning}/energielabel/dakisolatie/aannemer`,
};

export function routeVoorActie(actie: Actie, context: ActieContext = {}): Bestemming | null {
  if (actie.href.startsWith('https://')) return { extern: actie.href };
  if (actie.href === PLACEHOLDER_HREF) return { naar: NIET_BESCHIKBAAR_PAD };
  if (actie.type === 'bekijk-koopwoningen') return { naar: KOOPWONINGEN };

  const route = ROUTES[actie.type];
  if (!route || !context.woningId) return null;
  return { naar: route(`${KOOPWONINGEN}/${encodeURIComponent(context.woningId)}`) };
}
