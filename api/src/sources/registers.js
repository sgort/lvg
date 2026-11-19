// The register sources: BAG, Kadaster, LV WOZ, EP-online, building data and contractors.
// Mocked for now. Every function is async and returns a copy, so a real source can
// replace one function without changing its callers.
import { ProblemError } from '../core/http.js';
import { mock, scenarios } from '../mock/scenarios.js';

const copy = (value) => structuredClone(value);

// A property the citizen does not own is treated exactly like one that does not exist.
function findWoning(scenario, id) {
  const owned = scenarios[scenario] ?? [];
  const woning = owned.includes(id) ? mock.woningen[id] : undefined;
  if (!woning) {
    throw new ProblemError(
      404,
      'Woning niet gevonden',
      'Deze woning staat niet op uw naam, of bestaat niet.',
      'Ga terug naar uw koopwoningen.'
    );
  }
  return woning;
}

export const listWoningen = async (scenario) =>
  (scenarios[scenario] ?? []).map((id) => copy({ id, ...mock.woningen[id].bag }));

export const getWoning = async (scenario, id) => copy({ id, ...findWoning(scenario, id).bag });

export const getKadaster = async (scenario, id) => copy(findWoning(scenario, id).kadaster);

export const getWoz = async (scenario, id) => copy(findWoning(scenario, id).woz);

export const getEnergielabel = async (scenario, id) => copy(findWoning(scenario, id).energielabel);

/** Building and roof data, or null when there is none for this property. */
export const getDak = async (scenario, id) => copy(findWoning(scenario, id).gebouwgegevens);

export const getAannemers = async (scenario, id) => {
  findWoning(scenario, id);
  return copy(mock.aannemers);
};
