import React, { useState } from 'react';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import BuildingViewer from './components/3d/BuildingViewer';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Reports from './components/Reports';
import VulnerabilityMap from './components/VulnerabilityMap';
import { BuildingParams, AnalysisResult, ViewMode } from './types';
import { analyzeBuildingStructure } from './services/analysisService';

type AppStep = 'landing' | 'onboarding' | 'app';

const App: React.FC = () => {
  // Application Flow State
  const [appStep, setAppStep] = useState<AppStep>('landing');

  // Global State for Building Configuration
  const [buildingParams, setBuildingParams] = useState<BuildingParams>({
    year: 1998,
    typology: 'StiltApartment', // Default for India Demo
    material: 'Concrete',
    floors: 5,
    seismicZone: 'Zone IV',
    occupancy: 'Residential',
    lastInspection: '2023-01-15',
    concreteStrength: 2500, // M20-M25 approx psi equivalent
    elasticityModulus: 25
  });

  const [activeRetrofits, setActiveRetrofits] = useState<string[]>([]);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  
  // State to hold the screenshot function from the 3D viewer
  const [snapshotGenerator, setSnapshotGenerator] = useState<(() => string) | undefined>(undefined);

  const handleRunAnalysis = async () => {
    try {
      const result = await analyzeBuildingStructure(buildingParams);
      setAnalysis(result);
      setEmergencyMode(false);
      // If running from main app, switch to dashboard
      if (appStep === 'app') {
        setCurrentView('dashboard');
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    }
  };

  const handleLogin = () => {
    setAppStep('onboarding');
  };

  const handleOnboardingComplete = () => {
    setAppStep('app');
    setCurrentView('dashboard');
  };

  // 1. Layer 1: Landing Page
  if (appStep === 'landing') {
    return <LandingPage onLogin={handleLogin} />;
  }

  // 2. Layer 2: Onboarding Profile
  if (appStep === 'onboarding') {
    return (
      <Layout currentView="profile" setView={() => {}} onboardingMode={true}>
        <Profile 
          buildingParams={buildingParams}
          setBuildingParams={setBuildingParams}
          onRunAnalysis={handleRunAnalysis}
          onboardingMode={true}
          onCompleteOnboarding={handleOnboardingComplete}
        />
      </Layout>
    );
  }

  // 3. Layer 3: Main Application
  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      <div className="flex flex-col lg:flex-row h-full w-full">
        {/* Left/Top Panel: 3D Visualization */}
        <div className="h-1/2 lg:h-full lg:w-3/5 p-4 lg:pr-2">
           <BuildingViewer 
             params={buildingParams}
             activeRetrofits={activeRetrofits}
             emergencyMode={emergencyMode}
             vulnerabilityScore={analysis?.vulnerabilityScore || 0}
             visualizationMode={currentView === 'vulnerability' ? 'heatmap' : 'standard'}
             onRegisterSnapshot={(fn) => setSnapshotGenerator(() => fn)}
           />
        </div>

        {/* Right/Bottom Panel: Dashboard, Profile, Reports, or Vulnerability */}
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
            <VulnerabilityMap 
              analysis={analysis}
              buildingParams={buildingParams}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default App;