import React, { useState } from 'react';
import { Home, Lock, Unlock, MapPin, Zap, TrendingUp, Lightbulb, ChevronRight } from 'lucide-react';

const PropertyDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const publicInfo = {
    address: "Lange Hilleweg 73 B",
    postalCode: "3073 BJ",
    city: "Rotterdam",
    cadastralId: "G 3916",
    size: "138 m²",
    buildYear: 1990,
    energyLabel: "C",
    wozValue: "€ 317.000",
    wozDate: "1 januari 2018"
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mijn Woning Overzicht</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {publicInfo.address}, {publicInfo.postalCode} {publicInfo.city}
              </p>
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
              <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto border-4 border-blue-400 bg-blue-50 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-blue-800">Perceel 1560</p>
                        <p className="text-xs text-blue-600">Sectie T</p>
                      </div>
                    </div>
                  </div>
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
                  <p className="text-4xl font-bold text-gray-900">{publicInfo.wozValue}</p>
                  <p className="text-sm text-gray-600">Peildatum: {publicInfo.wozDate}</p>
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
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Unlock className="w-5 h-5" />
              Inloggen met DigiD
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDashboard;