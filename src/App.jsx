import React, { useState } from 'react';
import { Home, Lock, Unlock, MapPin, Zap, TrendingUp, Lightbulb, ChevronRight, X, CheckCircle, FileText, Share2 } from 'lucide-react';

const PropertyDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRoofInsulationModal, setShowRoofInsulationModal] = useState(false);
  const [dataConsentGiven, setDataConsentGiven] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState('');
  const [showCalculations, setShowCalculations] = useState(false);

  const publicInfo = {
    address: "Lange Hilleweg 73 B",
    postalCode: "3073 BJ",
    city: "Rotterdam",
    cadastralId: "G 3916",
    size: "158 m²",
    buildYear: 1990,
    energyLabel: "C",
    wozHistory: [
      { value: "€ 317.000", date: "1 januari 2025" },
      { value: "€ 304.000", date: "1 januari 2024" }
    ]
  };

  const personalizedInfo = {
    currentEnergyUsage: "Gemiddeld",
    potentialSavings: "€ 850/jaar",
    recommendedImprovements: [
      { item: "Dakisolatie verbeteren", cost: "€ 2.500 - € 4.000", savings: "€ 350/jaar", labelImprovement: "C → B" },
      { item: "HR++ beglazing", cost: "€ 4.000 - € 6.000", savings: "€ 300/jaar", labelImprovement: "C → B" },
      { item: "Vloerisolatie", cost: "€ 1.500 - € 3.000", savings: "€ 200/jaar", labelImprovement: "C → B" }
    ],
    monthlyUsage: [
      { month: "Jan", gas: 180, electric: 250 },
      { month: "Feb", gas: 160, electric: 240 },
      { month: "Mrt", gas: 120, electric: 220 },
      { month: "Apr", gas: 80, electric: 200 }
    ]
  };

  const buildingData = {
    gebouw: {
      gebouwtype: "woonhuis",
      bouwjaar: 1990,
      vloeroppervlakte_m2: 120,
      bezettingspatroon: "avonden_en_nachten"
    },
    dak: {
      daktype: "zadeldak",
      dakhelling_graden: 30,
      dakbedekking_materiaal: "bitumen_shingles",
      dakbeschot_materiaal: "hout",
      dakconditie: "goed"
    },
    klimaat: {
      klimaatzone: "Zone_5",
      gemiddelde_temperatuur_C: 10,
      gemiddelde_vochtigheid_procent: 70,
      windbelasting: "blootgesteld",
      zoninstraling_niveau: "hoog"
    },
    bestaande_isolatie: {
      type: "glaswol",
      dikte_mm: 100,
      R_waarde_m2K_per_W: 2.8,
      dampscherm_aanwezig: true,
      luchtlek_niveau: "gemiddeld"
    },
    vocht_en_ventilatie: {
      zolderventilatie_type: "nok_en_kierdak_ventilatie",
      vochtproblemen: "lichte_schimmel_in_hoeken",
      dakmembraan_type: "bitumen",
      dampdiffusierichting: "binnen_naar_buiten"
    },
    energie_en_budget: {
      doel_R_waarde_m2K_per_W: 6.0,
      energiekosten_per_kWh: 0.15,
      budget_limiet_euro: 2000,
      renovatie_haalbaarheid: "eenvoudig"
    },
    extra: {
      dak_kleur: "donkergrijs",
      plafond_afwerking_type: "gipsplaat",
      gewenste_levensduur_jaren: 25,
      lokale_bouwcode_versie: "Bouwbesluit_2021",
      brandwerendheidsklasse: "Klasse_A",
      geluidsisolatie_prioriteit: false
    }
  };

  const calculations = {
    aanname: {
      R_bestaand: 2.8,
      dak_oppervlakte_m2: 120,
      lambda_W_mK: 0.035,
      materiaal_cost_per_m3_eur: 80,
      install_cost_per_m2_per_100mm_eur: 25,
      huidige_jaarlijkse_verwarmingskosten_eur: 1200
    },
    berekeningen: [
      {
        doel_R: 3.0,
        delta_R: 0.2,
        extra_dikte_mm: 7.0,
        kost_per_m2_eur: 2.31,
        totale_kost_eur: 277.2,
        subsidie_eur: 27.72,
        netto_kost_eur: 249.48,
        jaarlijkse_besparing_eur: 80.0,
        terugverdientijd_jaar: 3.1
      },
      {
        doel_R: 4.0,
        delta_R: 1.2,
        extra_dikte_mm: 42.0,
        kost_per_m2_eur: 18.48,
        totale_kost_eur: 2217.6,
        subsidie_eur: 665.28,
        netto_kost_eur: 1552.32,
        jaarlijkse_besparing_eur: 320.0,
        terugverdientijd_jaar: 4.9
      },
      {
        doel_R: 6.0,
        delta_R: 3.2,
        extra_dikte_mm: 112.0,
        kost_per_m2_eur: 27.4,
        totale_kost_eur: 3288.0,
        subsidie_eur: 1103.4,
        netto_kost_eur: 2184.6,
        jaarlijkse_besparing_eur: 640.0,
        terugverdientijd_jaar: 3.4
      },
      {
        doel_R: 8.0,
        delta_R: 5.2,
        extra_dikte_mm: 182.0,
        kost_per_m2_eur: 60.06,
        totale_kost_eur: 7207.2,
        subsidie_eur: 3603.6,
        netto_kost_eur: 3603.6,
        jaarlijkse_besparing_eur: 780.0,
        terugverdientijd_jaar: 4.6
      }
    ]
  };

  const contractors = [
    { id: 1, name: "IsolatieGroep Rotterdam", specialty: "Dakisolatie specialist", rating: 4.8 },
    { id: 2, name: "EcoTherm Isolatie", specialty: "Duurzame isolatie", rating: 4.7 },
    { id: 3, name: "DakTotaal B.V.", specialty: "Complete dakoplossingen", rating: 4.9 },
    { id: 4, name: "WarmteWerken", specialty: "Energiebesparing", rating: 4.6 },
    { id: 5, name: "IsolatieXpert", specialty: "Snelle service", rating: 4.5 },
    { id: 6, name: "GreenRoof Solutions", specialty: "Groene daken & isolatie", rating: 4.8 }
  ];

  const handleRoofInsulationClick = () => {
    setShowRoofInsulationModal(true);
    setDataConsentGiven(false);
    setSelectedContractor('');
    setShowCalculations(false);
  };

  const handleRequestAdvice = () => {
    if (dataConsentGiven && selectedContractor) {
      setShowCalculations(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {/* Rijksoverheid Logo */}
              <div className="w-12 h-18 bg-blue-900 rounded flex items-center justify-center flex-shrink-0 p-2">
                <img 
                  src="/rijksoverheid-logo.png" 
                  alt="Rijksoverheid logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mijn Woning Overzicht</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {publicInfo.address}, {publicInfo.postalCode} {publicInfo.city}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsLoggedIn(!isLoggedIn)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isLoggedIn 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isLoggedIn ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {isLoggedIn ? 'Uitloggen' : 'Inloggen voor persoonlijk advies'}
            </button>
          </div>
        </div>

        {/* Public Information Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-700">Openbare Informatie</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cadastral Map */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Kadastrale Kaart
              </h3>
              <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
                <img 
                  src="/perceel-1560.png" 
                  alt="Kadastrale kaart - Perceel 1560" 
                  className="w-full h-auto"
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="bg-blue-500 bg-opacity-20 border-2 border-blue-600 rounded-lg w-40 h-40"></div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Kadastrale aanduiding:</span>
                  <span className="font-medium">{publicInfo.cadastralId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Grootte:</span>
                  <span className="font-medium">{publicInfo.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bouwjaar:</span>
                  <span className="font-medium">{publicInfo.buildYear}</span>
                </div>
              </div>
            </div>

            {/* Energy Label & WOZ Value */}
            <div className="space-y-6">
              {/* Energy Label */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Energielabel
                </h3>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-yellow-400 flex items-center justify-center">
                      <span className="text-6xl font-bold text-white">{publicInfo.energyLabel}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-1 mb-2">
                  {['A++++', 'A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'].map((label, i) => (
                    <div 
                      key={label}
                      className={`h-8 flex-1 flex items-center justify-center text-xs font-semibold ${
                        label === publicInfo.energyLabel 
                          ? 'bg-yellow-400 text-white ring-2 ring-yellow-600' 
                          : i < 5 ? 'bg-green-200 text-green-800' : i < 7 ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'
                      }`}
                    >
                      {label.length > 2 ? label.slice(-1) : label}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 text-center">Gemiddeld energieverbruik</p>
              </div>

              {/* WOZ Value */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  WOZ-waarde
                </h3>
                <div className="text-center mb-4">
                  <p className="text-4xl font-bold text-gray-900">{publicInfo.wozHistory[0].value}</p>
                  <p className="text-sm text-gray-600">Peildatum: {publicInfo.wozHistory[0].date}</p>
                </div>
                
                {/* Historical WOZ Values Table */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Historisch overzicht</h4>
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Adres</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">WOZ-waarde</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Peildatum</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {publicInfo.wozHistory.map((woz, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {publicInfo.address}, {publicInfo.postalCode}
                            </td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{woz.value}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{woz.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    De WOZ-waarde is de getaxeerde marktwaarde van uw woning en wordt jaarlijks vastgesteld door de gemeente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personalized Information Section */}
        {isLoggedIn ? (
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
                    <p className="text-2xl font-bold text-gray-900">{personalizedInfo.currentEnergyUsage}</p>
                    <p className="text-sm text-gray-600 mt-2">Potentiële besparing</p>
                    <p className="text-xl font-bold text-green-600">{personalizedInfo.potentialSavings}</p>
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
                            style={{ height: `${(data.electric / 300) * 100}%` }}
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
                          <span className="font-semibold text-gray-900">Stroom (zonder teruglevering)</span>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-700">1 persoon: 122 kWh</span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-gray-700 rounded-full" style={{ width: '39%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-orange-600 font-medium">Uw verbruik: 159 kWh</span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-400 rounded-full" style={{ width: '51%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-700">2 personen: 190 kWh</span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-gray-700 rounded-full" style={{ width: '61%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-700">3 personen: 229 kWh</span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-gray-700 rounded-full" style={{ width: '73%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-700">4 personen: 268 kWh</span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-gray-700 rounded-full" style={{ width: '86%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-700">5 personen: 296 kWh</span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-gray-700 rounded-full" style={{ width: '95%' }}></div>
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
                              <div className="h-full bg-gray-700 rounded-full" style={{ width: '44%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-700">Rijtjeswoning: 22 m³</span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-gray-700 rounded-full" style={{ width: '56%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-blue-600 font-medium">Uw verbruik: 26 m³</span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-400 rounded-full" style={{ width: '56%' }}></div>
                            </div>
                          </div>
                                                    <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-700">Hoekwoning: 26 m³</span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-gray-700 rounded-full" style={{ width: '67%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-700">2 onder 1 kap: 30 m³</span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-gray-700 rounded-full" style={{ width: '77%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-700">Vrijstaande woning: 39 m³</span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-gray-700 rounded-full" style={{ width: '100%' }}></div>
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
                      onClick={() => index === 0 && handleRoofInsulationClick()}
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
        ) : (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm p-12 text-center border-2 border-blue-200 border-dashed">
            <Lock className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Log in voor persoonlijk verduurzamingsadvies
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Ontdek uw energieverbruik, krijg concrete besparingstips en zie direct welke verbeteringen 
              uw energielabel kunnen verhogen. Plus informatie over beschikbare subsidies en financieringsmogelijkheden.
            </p>
            <button 
              onClick={() => setIsLoggedIn(true)}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold text-base transition-colors"
            >
              <div className="bg-blue-900 rounded px-2 py-1 flex items-center justify-center">
                <span className="text-white font-bold text-xs">DigiD</span>
              </div>
              Inloggen met DigiD
            </button>
          </div>
        )}
      </div>

      {/* Roof Insulation Modal */}
      {showRoofInsulationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Dakisolatie verbeteren</h2>
              <button 
                onClick={() => setShowRoofInsulationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
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
                        <dd className="font-medium">{buildingData.gebouw.bezettingspatroon.replace(/_/g, ' ')}</dd>
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
                        <dd className="font-medium">{buildingData.dak.dakbedekking_materiaal.replace(/_/g, ' ')}</dd>
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
                        <dd className="font-medium">{buildingData.bestaande_isolatie.R_waarde_m2K_per_W} m²·K/W</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Dampscherm:</dt>
                        <dd className="font-medium">{buildingData.bestaande_isolatie.dampscherm_aanwezig ? 'Ja' : 'Nee'}</dd>
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
                        <dd className="font-medium">{buildingData.vocht_en_ventilatie.zolderventilatie_type.replace(/_/g, ' ')}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Vochtproblemen:</dt>
                        <dd className="font-medium">{buildingData.vocht_en_ventilatie.vochtproblemen.replace(/_/g, ' ')}</dd>
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
                    checked={dataConsentGiven}
                    onChange={(e) => setDataConsentGiven(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="dataConsent" className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Share2 className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-900">Toestemming voor gegevensdeling</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Ik geef toestemming om mijn gebouwgegevens te delen met de geselecteerde aannemer 
                      voor het maken van een offerte voor dakisolatie. Deze gegevens worden alleen gebruikt 
                      voor dit doel en niet gedeeld met derden.
                    </p>
                  </label>
                </div>
              </div>

              {/* Step 3: Contractor Selection */}
              {dataConsentGiven && (
                <div className="border border-green-200 bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecteer een aannemer</h3>
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
                  
                  {selectedContractor && (
                    <button
                      onClick={handleRequestAdvice}
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
                    <h3 className="text-lg font-semibold text-gray-900">Voorbeeldberekening dakisolatie</h3>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    Op basis van uw gebouwgegevens hebben we verschillende isolatie-opties berekend:
                  </p>

                  {/* Assumptions */}
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Uitgangspunten</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Huidige R-waarde:</span>
                        <span className="font-medium">{calculations.aanname.R_bestaand} m²·K/W</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dakoppervlakte:</span>
                        <span className="font-medium">{calculations.aanname.dak_oppervlakte_m2} m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Huidige verwarmingskosten:</span>
                        <span className="font-medium">€ {calculations.aanname.huidige_jaarlijkse_verwarmingskosten_eur}/jaar</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Energiekosten:</span>
                        <span className="font-medium">€ {buildingData.energie_en_budget.energiekosten_per_kWh}/kWh</span>
                      </div>
                    </div>
                  </div>

                  {/* Calculations Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Doel R<br/>(m²·K/W)</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">ΔR</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Extra dikte<br/>(mm)</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Kosten/m²<br/>(€)</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Totale kosten<br/>(€)</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Subsidie<br/>(€)</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Netto kosten<br/>(€)</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Besparing/jaar<br/>(€)</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Terugverdientijd<br/>(jaar)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {calculations.berekeningen.map((calc, idx) => (
                          <tr key={idx} className={`border-t border-gray-200 ${calc.doel_R === 6.0 ? 'bg-green-50 font-semibold' : ''}`}>
                            <td className="px-3 py-2">{calc.doel_R.toFixed(1)}</td>
                            <td className="px-3 py-2">{calc.delta_R.toFixed(1)}</td>
                            <td className="px-3 py-2">{calc.extra_dikte_mm.toFixed(0)}</td>
                            <td className="px-3 py-2">€ {calc.kost_per_m2_eur.toFixed(2)}</td>
                            <td className="px-3 py-2">€ {calc.totale_kost_eur.toFixed(0)}</td>
                            <td className="px-3 py-2 text-green-600">€ {calc.subsidie_eur.toFixed(0)}</td>
                            <td className="px-3 py-2 font-semibold">€ {calc.netto_kost_eur.toFixed(0)}</td>
                            <td className="px-3 py-2 text-green-600">€ {calc.jaarlijkse_besparing_eur.toFixed(0)}</td>
                            <td className="px-3 py-2">{calc.terugverdientijd_jaar.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 bg-green-100 border border-green-300 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Aanbevolen:</strong> R-waarde 6.0 m²·K/W (gemarkeerd in groen) biedt de beste balans 
                      tussen investering, subsidie en terugverdientijd van {calculations.berekeningen[2].terugverdientijd_jaar} jaar.
                    </p>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Offerte aanvragen
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                      Download PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDashboard;