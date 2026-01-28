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
      <div className="flex flex-col xl:flex-row gap-4 h-full w-full p-4 lg:p-6">
        <div className="w-full xl:w-7/12 bg-slate-900/60 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="relative w-full h-[320px] sm:h-[420px] xl:h-[calc(100vh-220px)]">
            <BuildingViewer
              params={buildingParams}
              activeRetrofits={activeRetrofits}
              emergencyMode={emergencyMode}
              vulnerabilityScore={analysis?.vulnerabilityScore ?? 0}
              visualizationMode={currentView === 'vulnerability' ? 'heatmap' : 'standard'}
              onRegisterSnapshot={registerSnapshot}
            />
          </div>
        </div>

        <div className="w-full xl:flex-1 flex">
          <div className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl shadow-xl flex flex-col min-h-[360px] overflow-hidden">
            <div className="flex-1 overflow-y-auto">
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

              {currentView === 'profile' && <Profile />}

              {currentView === 'reports' && (
                <Reports buildingParams={buildingParams} analysis={analysis} getSnapshot={snapshotGenerator} />
              )}

              {currentView === 'vulnerability' && (
                <VulnerabilityMap analysis={analysis} buildingParams={buildingParams} />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ApplicationView;

