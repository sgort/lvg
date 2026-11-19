import { useState } from 'react';

import Footer from './components/Footer';
import LoginPrompt from './components/LoginPrompt';
import PageHeader from './components/PageHeader';
import PersonalInfoSection from './components/PersonalInfoSection';
import PublicInfoSection from './components/PublicInfoSection';
import RoofInsulationModal from './components/RoofInsulationModal';
import { useAuth } from './hooks/useAuth';
import { useInsulationCalculation } from './hooks/useInsulationCalculation';
import { useProperty } from './hooks/useProperty';
import { DEFAULT_PROPERTY_ID } from './services/propertyService';

// The page: data, session and calculation come from hooks, and the sections only
// render them. Address search will replace DEFAULT_PROPERTY_ID later.
const PropertyDashboard = () => {
  const { session, isLoggedIn, login, logout } = useAuth();
  const property = useProperty(DEFAULT_PROPERTY_ID, session);
  const calculation = useInsulationCalculation();
  const [showRoofInsulationModal, setShowRoofInsulationModal] = useState(false);

  const openRoofInsulation = () => {
    calculation.reset();
    setShowRoofInsulationModal(true);
  };

  // The modal needs personal building data, which is cleared on logout, so it
  // closes too. Keyboard focus can still reach the header button behind it.
  const handleLogout = () => {
    setShowRoofInsulationModal(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          publicInfo={property.publicInfo.data}
          isLoggedIn={isLoggedIn}
          onToggleLogin={isLoggedIn ? handleLogout : login}
        />

        <PublicInfoSection publicInfoState={property.publicInfo} />

        {isLoggedIn ? (
          <PersonalInfoSection
            personalInfoState={property.personalInfo}
            onOpenRoofInsulation={openRoofInsulation}
          />
        ) : (
          <LoginPrompt onLogin={login} />
        )}

        <Footer />
      </div>

      {showRoofInsulationModal && (
        <RoofInsulationModal
          buildingDataState={property.buildingData}
          contractorsState={property.contractors}
          calculation={calculation}
          onClose={() => setShowRoofInsulationModal(false)}
        />
      )}
    </div>
  );
};

export default PropertyDashboard;
