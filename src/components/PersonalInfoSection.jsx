import { Zap, Lightbulb, ChevronRight } from 'lucide-react';
import DataStatus from './DataStatus';

const PersonalInfoSection = ({ personalInfoState, onOpenRoofInsulation }) => {
  const personalizedInfo = personalInfoState.data;
  if (!personalizedInfo) {
    return (
      <div className="mb-6">
        <DataStatus state={personalInfoState} />
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <h2 className="text-lg font-semibold text-gray-700">Persoonlijke Informatie & Advies</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Energy Usage */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Uw Energieverbruik
          </h3>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Huidige status</p>
              <p className="text-2xl font-bold text-gray-900">
                {personalizedInfo.currentEnergyUsage}
              </p>
              <p className="text-sm text-gray-600 mt-2">Potentiële besparing</p>
              <p className="text-xl font-bold text-green-600">
                {personalizedInfo.potentialSavings}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {personalizedInfo.monthlyUsage.map((data) => (
                <div key={data.month} className="text-center">
                  <p className="text-xs text-gray-600 mb-1">{data.month}</p>
                  <div className="h-20 flex items-end gap-0.5">
                    <div
                      className="bg-orange-400 w-full rounded-t"
                      style={{ height: `${(data.gas / 200) * 100}%` }}
                      title={`Gas: ${data.gas}m³`}
                    ></div>
                    <div
                      className="bg-blue-400 w-full rounded-t"
                      style={{
                        height: `${(data.electric / 300) * 100}%`,
                      }}
                      title={`Elektra: ${data.electric}kWh`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-400 rounded"></div>
                <span>Gas (m³)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                <span>Elektra (kWh)</span>
              </div>
            </div>

            {/* Comparison Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-base font-semibold text-gray-900 mb-4">
                Uw verbruik vergeleken met andere huishoudens en woningtypes
              </h4>

              <div className="grid grid-cols-2 gap-6">
                {/* Electricity Comparison */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-orange-600" />
                    <span className="font-semibold text-gray-900">
                      Stroom (zonder teruglevering)
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">1 persoon: 122 kWh</span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-700 rounded-full"
                          style={{ width: '39%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-orange-600 font-medium">Uw verbruik: 159 kWh</span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-400 rounded-full"
                          style={{ width: '51%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">2 personen: 190 kWh</span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-700 rounded-full"
                          style={{ width: '61%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">3 personen: 229 kWh</span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-700 rounded-full"
                          style={{ width: '73%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">4 personen: 268 kWh</span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-700 rounded-full"
                          style={{ width: '86%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">5 personen: 296 kWh</span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-700 rounded-full"
                          style={{ width: '95%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gas Comparison */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-xs">●</span>
                    </div>
                    <span className="font-semibold text-gray-900">Gas</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">Appartement: 17 m³</span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-700 rounded-full"
                          style={{ width: '44%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">Rijtjeswoning: 22 m³</span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-700 rounded-full"
                          style={{ width: '56%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-blue-600 font-medium">Uw verbruik: 26 m³</span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 rounded-full"
                          style={{ width: '56%' }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">Hoekwoning: 26 m³</span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-700 rounded-full"
                          style={{ width: '67%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">2 onder 1 kap: 30 m³</span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-700 rounded-full"
                          style={{ width: '77%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">Vrijstaande woning: 39 m³</span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-700 rounded-full"
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sustainability Recommendations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Verduurzamingsadvies
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Op basis van uw woning kunnen deze verbeteringen uw energielabel verhogen:
          </p>
          <div className="space-y-3">
            {personalizedInfo.recommendedImprovements.map((improvement, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                onClick={() => index === 0 && onOpenRoofInsulation()}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{improvement.item}</h4>
                  <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded">
                    {improvement.labelImprovement}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Investering:</span> {improvement.cost}
                  </p>
                  <p className="text-green-700">
                    <span className="font-medium">Besparing:</span> {improvement.savings}
                  </p>
                </div>
                <div className="mt-3 flex items-center text-blue-600 text-sm font-medium">
                  Meer details <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 mt-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Klaar om te verduurzamen?</h3>
            <p className="text-blue-100">
              Ontvang een persoonlijk adviesgesprek en ontdek welke subsidies beschikbaar zijn.
            </p>
          </div>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap">
            Plan adviesgesprek
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
