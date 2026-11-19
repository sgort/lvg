// Inputs for bereken_isolatie_opties. Moved from src/services/insulationParams.js and
// fetchAllCalculations: the cost figures and target values are business rules, which
// belong in the API, not in the front-end.
export const TARGET_R_VALUES = [3.0, 4.0, 6.0, 8.0];

export const LAMBDA_W_MK = 0.035;
export const MATERIAAL_COST_PER_M3 = 80;
export const INSTALL_COST_PER_M2_PER_100MM = 25;

const LOCAL_BASE_URL = 'http://localhost:8081/engine-rest';

/** Inputs from the building data. The roof area is the roof's own, not the floor area. */
export const buildIsolatieParams = (gebouwgegevens) => ({
  huidige_r_waarde: gebouwgegevens.bestaande_isolatie.R_waarde_m2K_per_W,
  dak_oppervlakte_m2: gebouwgegevens.dak.oppervlakte_m2,
  lambda_w_mk: LAMBDA_W_MK,
  materiaal_cost_per_m3: MATERIAAL_COST_PER_M3,
  install_cost_per_m2_per_100mm: INSTALL_COST_PER_M2_PER_100MM,
});

/**
 * Where Operaton is, from the app settings. The local engine needs a login, which
 * defaults to demo/demo. Elsewhere there is no default, and an empty OPERATON_USER means
 * no login: the public engine evaluates decisions without one.
 */
export function operatonConfig(env) {
  const baseUrl = (env.OPERATON_BASE_URL || LOCAL_BASE_URL).replace(/\/+$/, '');
  const isLocal = baseUrl === LOCAL_BASE_URL;
  const user = env.OPERATON_USER ?? (isLocal ? 'demo' : undefined);
  const password = env.OPERATON_PASSWORD ?? (isLocal ? 'demo' : undefined);
  return { baseUrl, user: user || undefined, password: password || undefined };
}
