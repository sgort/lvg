// Calls the Operaton decision bereken_isolatie_opties. Moved from the browser
// (src/services/operatonService.js) to the API, so credentials and the engine's address
// never reach a bundle.
const DECISION_KEY = 'bereken_isolatie_opties';
const TIMEOUT_MS = 10_000;

// The outputs an option needs. `aanbevolen` and `aanbeveling` are optional: an older
// version of the decision lacks the first, and only one rule has the second.
const REQUIRED_OUTPUTS = [
  'extra_dikte_mm',
  'totale_kosten',
  'subsidie',
  'netto_kosten',
  'besparing_jaar',
  'terugverdientijd',
];

const VARIABLE_TYPES = {
  huidige_r_waarde: 'Double',
  dak_oppervlakte_m2: 'Double',
  lambda_w_mk: 'Double',
  materiaal_cost_per_m3: 'Integer',
  install_cost_per_m2_per_100mm: 'Integer',
  doel_r_waarde: 'Double',
};

/**
 * Evaluates the decision for one target R-value and returns its single result, as
 * Operaton sends it: { output: { value, type } }.
 */
export async function evaluateIsolatie(params, { baseUrl, user, password, fetch }) {
  const headers = { 'Content-Type': 'application/json' };
  if (user && password) {
    headers.Authorization = `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;
  }
  const variables = Object.fromEntries(
    Object.entries(VARIABLE_TYPES).map(([name, type]) => [name, { value: params[name], type }])
  );

  const response = await fetch(`${baseUrl}/decision-definition/key/${DECISION_KEY}/evaluate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ variables }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    // The body may echo the request, so it is not included in the error.
    throw new Error(`DMN evaluation failed (${response.status})`);
  }
  const results = await response.json();
  const result = Array.isArray(results) ? results[0] : undefined;
  // No matching rule, or a result without the amounts, is not an advice. Throwing lets the
  // caller report the advice as unavailable instead of inventing zero amounts.
  const missing = REQUIRED_OUTPUTS.filter((name) => typeof result?.[name]?.value !== 'number');
  if (missing.length > 0) {
    throw new Error(`DMN evaluation gave no usable result (missing ${missing.join(', ')})`);
  }
  return result;
}
