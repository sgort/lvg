import { X, CheckCircle, FileText, Share2 } from 'lucide-react';
import DataStatus from './DataStatus';

// The modal opens even while building data is loading; it then shows the message
// instead of its steps. The contractor step does the same for contractors.
const RoofInsulationModal = ({ buildingDataState, contractorsState, calculation, onClose }) => {
  const buildingData = buildingDataState.data;
  const contractors = contractorsState.data;
  const {
    consentGiven,
    setConsentGiven,
    selectedContractor,
    setSelectedContractor,
    showCalculations,
    calculations,
    isLoading,
    error,
    requestCalculation,
  } = calculation;

  if (!buildingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Dakisolatie verbeteren</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6">
            <DataStatus state={buildingDataState} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Dakisolatie verbeteren</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Building Data */}
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Uw gebouwgegevens</h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Gebouw */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Gebouw</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Type:</dt>
                    <dd className="font-medium">{buildingData.gebouw.gebouwtype}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Bouwjaar:</dt>
                    <dd className="font-medium">{buildingData.gebouw.bouwjaar}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Vloeroppervlakte:</dt>
                    <dd className="font-medium">{buildingData.gebouw.vloeroppervlakte_m2} m²</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Bezetting:</dt>
                    <dd className="font-medium">
                      {buildingData.gebouw.bezettingspatroon.replace(/_/g, ' ')}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Dak */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Dak</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Type:</dt>
                    <dd className="font-medium">{buildingData.dak.daktype}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Helling:</dt>
                    <dd className="font-medium">{buildingData.dak.dakhelling_graden}°</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Bedekking:</dt>
                    <dd className="font-medium">
                      {buildingData.dak.dakbedekking_materiaal.replace(/_/g, ' ')}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Conditie:</dt>
                    <dd className="font-medium">{buildingData.dak.dakconditie}</dd>
                  </div>
                </dl>
              </div>

              {/* Bestaande Isolatie */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Huidige isolatie</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Type:</dt>
                    <dd className="font-medium">{buildingData.bestaande_isolatie.type}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Dikte:</dt>
                    <dd className="font-medium">{buildingData.bestaande_isolatie.dikte_mm} mm</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">R-waarde:</dt>
                    <dd className="font-medium">
                      {buildingData.bestaande_isolatie.R_waarde_m2K_per_W} m²·K/W
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Dampscherm:</dt>
                    <dd className="font-medium">
                      {buildingData.bestaande_isolatie.dampscherm_aanwezig ? 'Ja' : 'Nee'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Klimaat */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Klimaat & Ventilatie</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Zone:</dt>
                    <dd className="font-medium">{buildingData.klimaat.klimaatzone}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Ventilatie:</dt>
                    <dd className="font-medium">
                      {buildingData.vocht_en_ventilatie.zolderventilatie_type.replace(/_/g, ' ')}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Vochtproblemen:</dt>
                    <dd className="font-medium">
                      {buildingData.vocht_en_ventilatie.vochtproblemen.replace(/_/g, ' ')}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Step 2: Data Consent */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="dataConsent"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="dataConsent" className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Share2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-900">
                    Toestemming voor gegevensdeling
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Ik geef toestemming om mijn gebouwgegevens te delen met de geselecteerde aannemer
                  voor het maken van een offerte voor dakisolatie. Deze gegevens worden alleen
                  gebruikt voor dit doel en niet gedeeld met derden.
                </p>
              </label>
            </div>
          </div>

          {/* Step 3: Contractor Selection */}
          {consentGiven && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecteer een aannemer</h3>
              {contractors ? (
                <select
                  value={selectedContractor}
                  onChange={(e) => setSelectedContractor(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Kies een aannemer --</option>
                  {contractors.map((contractor) => (
                    <option key={contractor.id} value={contractor.id}>
                      {contractor.name} - {contractor.specialty} (★ {contractor.rating})
                    </option>
                  ))}
                </select>
              ) : (
                <DataStatus state={contractorsState} />
              )}

              {selectedContractor && (
                <button
                  onClick={() => requestCalculation(buildingData)}
                  className="mt-4 w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Vraag offerte aan
                </button>
              )}
            </div>
          )}

          {/* Step 4: Calculations */}
          {showCalculations && (
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Voorbeeldberekening dakisolatie
                </h3>
              </div>

              {/* NEW: Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Berekeningen laden...</span>
                </div>
              )}

              {/* NEW: Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-semibold">Fout bij berekeningen</p>
                  <p className="text-red-600 text-sm">{error}</p>
                  <p className="text-red-600 text-sm mt-2">
                    De rekenservice is tijdelijk niet bereikbaar. Probeer het later opnieuw.
                  </p>
                </div>
              )}

              {/* Existing calculations display - only show if data loaded */}
              {!isLoading && calculations && (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Op basis van uw gebouwgegevens hebben we verschillende isolatie-opties berekend:
                  </p>

                  {/* Assumptions section */}
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Uitgangspunten</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Huidige R-waarde:</span>
                        <span className="font-medium">
                          {calculations.aanname.R_bestaand} m²·K/W
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dakoppervlakte:</span>
                        <span className="font-medium">
                          {calculations.aanname.dak_oppervlakte_m2} m²
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Huidige verwarmingskosten:</span>
                        <span className="font-medium">
                          € {calculations.aanname.huidige_jaarlijkse_verwarmingskosten_eur}
                          /jaar
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Energiekosten:</span>
                        <span className="font-medium">
                          € {buildingData.energie_en_budget.energiekosten_per_kWh}
                          /kWh
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Calculations table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">
                            Doel R<br />
                            (m²·K/W)
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">ΔR</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">
                            Extra dikte
                            <br />
                            (mm)
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">
                            Kosten/m²
                            <br />
                            (€)
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">
                            Totale kosten
                            <br />
                            (€)
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">
                            Subsidie
                            <br />
                            (€)
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">
                            Netto kosten
                            <br />
                            (€)
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">
                            Besparing/jaar
                            <br />
                            (€)
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">
                            Terugverdientijd
                            <br />
                            (jaar)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {calculations.berekeningen.map((calc, idx) => (
                          <tr
                            key={idx}
                            className={`border-t border-gray-200 ${calc.doel_R === 6.0 ? 'bg-green-50 font-semibold' : ''}`}
                          >
                            <td className="px-3 py-2">{calc.doel_R.toFixed(1)}</td>
                            <td className="px-3 py-2">{calc.delta_R.toFixed(1)}</td>
                            <td className="px-3 py-2">{calc.extra_dikte_mm.toFixed(0)}</td>
                            <td className="px-3 py-2">€ {calc.kost_per_m2_eur.toFixed(2)}</td>
                            <td className="px-3 py-2">€ {calc.totale_kost_eur.toFixed(0)}</td>
                            <td className="px-3 py-2 text-green-600">
                              € {calc.subsidie_eur.toFixed(0)}
                            </td>
                            <td className="px-3 py-2 font-semibold">
                              € {calc.netto_kost_eur.toFixed(0)}
                            </td>
                            <td className="px-3 py-2 text-green-600">
                              € {calc.jaarlijkse_besparing_eur.toFixed(0)}
                            </td>
                            <td className="px-3 py-2">{calc.terugverdientijd_jaar.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Recommendation */}
                  <div className="mt-4 bg-green-100 border border-green-300 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      {calculations.berekeningen[2].aanbeveling ||
                        `Aanbevolen: R-waarde 6.0 m²·K/W (gemarkeerd in groen) biedt de beste balans 
               tussen investering, subsidie en terugverdientijd van ${calculations.berekeningen[2].terugverdientijd_jaar.toFixed(1)} jaar.`}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 flex gap-3">
                    <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Offerte aanvragen
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                      Download PDF
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoofInsulationModal;
