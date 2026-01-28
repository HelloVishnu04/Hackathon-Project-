import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import BuildingViewer from '../components/3d/BuildingViewer';
import Dashboard from '../components/Dashboard';
import Profile from '../components/Profile';
import Reports from '../components/Reports';
import VulnerabilityMap from '../components/VulnerabilityMap';
import { useAppState } from '../state/AppStateContext';

const ApplicationView: React.FC = () => {
  const {
    buildingParams,
    setBuildingParams,
    activeRetrofits,
    setActiveRetrofits,
    emergencyMode,
    setEmergencyMode,
    analysis,
    setAnalysis,
    currentView,
    setCurrentView,
    snapshotGenerator,
    registerSnapshot,
    handleRunAnalysis,
    hasCompletedOnboarding,
  } = useAppState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      navigate('/setup', { replace: true });
    }
  }, [hasCompletedOnboarding, navigate]);

  if (!hasCompletedOnboarding) {
    return null;
  }

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      <div className="flex flex-col lg:flex-row h-full w-full">
        <div className="h-1/2 lg:h-full lg:w-3/5 p-4 lg:pr-2">
          <BuildingViewer
            params={buildingParams}
            activeRetrofits={activeRetrofits}
            emergencyMode={emergencyMode}
            vulnerabilityScore={analysis?.vulnerabilityScore ?? 0}
            visualizationMode={currentView === 'vulnerability' ? 'heatmap' : 'standard'}
            onRegisterSnapshot={registerSnapshot}
          />
        </div>

        <div className="h-1/2 lg:h-full lg:w-2/5 p-4 lg:pl-2 overflow-hidden">
          {currentView === 'dashboard' && (
            <Dashboard
              buildingParams={buildingParams}
              setBuildingParams={setBuildingParams}
              activeRetrofits={activeRetrofits}
              setActiveRetrofits={setActiveRetrofits}
              emergencyMode={emergencyMode}
              setEmergencyMode={setEmergencyMode}
              analysis={analysis}
              setAnalysis={setAnalysis}
              getSnapshot={snapshotGenerator}
              setView={setCurrentView}
            />
          )}

          {currentView === 'profile' && (
            <Profile
              buildingParams={buildingParams}
              setBuildingParams={setBuildingParams}
              onRunAnalysis={handleRunAnalysis}
            />
          )}

          {currentView === 'reports' && (
            <Reports
              buildingParams={buildingParams}
              analysis={analysis}
              getSnapshot={snapshotGenerator}
            />
          )}

          {currentView === 'vulnerability' && (
            <VulnerabilityMap analysis={analysis} buildingParams={buildingParams} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ApplicationView;
