import { MapPin, Zap, TrendingUp } from 'lucide-react';
import DataStatus from './DataStatus';

const PublicInfoSection = ({ publicInfoState }) => {
  const publicInfo = publicInfoState.data;
  if (!publicInfo) {
    return (
      <div className="mb-6">
        <DataStatus state={publicInfoState} />
      </div>
    );
  }

  return (
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
                      : i < 5
                        ? 'bg-green-200 text-green-800'
                        : i < 7
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-red-200 text-red-800'
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
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Adres
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        WOZ-waarde
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Peildatum
                      </th>
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
                De WOZ-waarde is de getaxeerde marktwaarde van uw woning en wordt jaarlijks
                vastgesteld door de gemeente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicInfoSection;
