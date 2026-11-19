import { Lock } from 'lucide-react';

const LoginPrompt = ({ onLogin }) => (
  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm p-12 text-center border-2 border-blue-200 border-dashed">
    <Lock className="w-16 h-16 text-blue-400 mx-auto mb-4" />
    <h3 className="text-2xl font-bold text-gray-900 mb-3">
      Log in voor persoonlijk verduurzamingsadvies
    </h3>
    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
      Ontdek uw energieverbruik, krijg concrete besparingstips en zie direct welke verbeteringen uw
      energielabel kunnen verhogen. Plus informatie over beschikbare subsidies en
      financieringsmogelijkheden.
    </p>
    <button
      onClick={onLogin}
      className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold text-base transition-colors"
    >
      <div className="bg-blue-900 rounded px-2 py-1 flex items-center justify-center">
        <span className="text-white font-bold text-xs">DigiD</span>
      </div>
      Inloggen met DigiD
    </button>
  </div>
);

export default LoginPrompt;
