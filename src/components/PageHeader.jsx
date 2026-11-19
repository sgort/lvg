import { Lock, Unlock, MapPin } from 'lucide-react';

// publicInfo is null while public data is loading or has failed; the header then
// renders without the address.
const PageHeader = ({ publicInfo, isLoggedIn, onToggleLogin }) => (
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
          {publicInfo && (
            <p className="text-gray-600 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {publicInfo.address}, {publicInfo.postalCode} {publicInfo.city}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onToggleLogin}
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
);

export default PageHeader;
