import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BuildingParams, AnalysisResult, ViewMode } from '../types';
import { analyzeBuildingStructure } from '../services/analysisService';

type SnapshotGenerator = (() => string) | undefined;

type AppStateContextValue = {
  buildingParams: BuildingParams;
  setBuildingParams: React.Dispatch<React.SetStateAction<BuildingParams>>;
  activeRetrofits: string[];
  setActiveRetrofits: React.Dispatch<React.SetStateAction<string[]>>;
  emergencyMode: boolean;
  setEmergencyMode: React.Dispatch<React.SetStateAction<boolean>>;
  analysis: AnalysisResult | null;
  setAnalysis: React.Dispatch<React.SetStateAction<AnalysisResult | null>>;
  currentView: ViewMode;
  setCurrentView: React.Dispatch<React.SetStateAction<ViewMode>>;
  snapshotGenerator: SnapshotGenerator;
  registerSnapshot: (fn: () => string) => void;
  handleRunAnalysis: () => Promise<void>;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  signOut: () => void;
};

const DEFAULT_BUILDING_PARAMS: BuildingParams = {
  year: 1998,
  typology: 'StiltApartment',
  material: 'Concrete',
  floors: 5,
  seismicZone: 'Zone IV',
  occupancy: 'Residential',
  lastInspection: '2023-01-15',
  concreteStrength: 2500,
  elasticityModulus: 25,
};

const BUILDING_PARAMS_KEY = 'safe_building_params';
const ONBOARDING_STATUS_KEY = 'safe_onboarding_complete';
const LEGACY_BUILDING_PARAMS_KEY = 'structura_building_params';
const LEGACY_ONBOARDING_STATUS_KEY = 'structura_onboarding_complete';

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buildingParams, setBuildingParams] = useState<BuildingParams>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(BUILDING_PARAMS_KEY) ?? localStorage.getItem(LEGACY_BUILDING_PARAMS_KEY);
      if (stored) {
        try {
          return { ...DEFAULT_BUILDING_PARAMS, ...JSON.parse(stored) } as BuildingParams;
        } catch (error) {
          console.warn('Failed to parse stored building params:', error);
        }
      }
    }
    return DEFAULT_BUILDING_PARAMS;
  });
  const [activeRetrofits, setActiveRetrofits] = useState<string[]>([]);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [snapshotGenerator, setSnapshotGenerator] = useState<SnapshotGenerator>(undefined);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(ONBOARDING_STATUS_KEY) ?? localStorage.getItem(LEGACY_ONBOARDING_STATUS_KEY);
      return stored === 'true';
    }
    return false;
  });

  const registerSnapshot = useCallback((fn: () => string) => {
    setSnapshotGenerator(() => fn);
  }, []);

  const handleRunAnalysis = useCallback(async () => {
    try {
      const result = await analyzeBuildingStructure(buildingParams);
      setAnalysis(result);
      setEmergencyMode(false);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  }, [buildingParams]);

  const completeOnboarding = useCallback(() => {
    setHasCompletedOnboarding(true);
  }, []);

  const resetOnboarding = useCallback(() => {
    setHasCompletedOnboarding(false);
  }, []);

  const signOut = useCallback(() => {
    setBuildingParams(() => ({ ...DEFAULT_BUILDING_PARAMS }));
    setActiveRetrofits([]);
    setEmergencyMode(false);
    setAnalysis(null);
    setCurrentView('dashboard');
    setSnapshotGenerator(undefined);
    setHasCompletedOnboarding(false);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(BUILDING_PARAMS_KEY);
      localStorage.removeItem(ONBOARDING_STATUS_KEY);
      localStorage.removeItem(LEGACY_BUILDING_PARAMS_KEY);
      localStorage.removeItem(LEGACY_ONBOARDING_STATUS_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_STATUS_KEY, hasCompletedOnboarding ? 'true' : 'false');
      localStorage.removeItem(LEGACY_ONBOARDING_STATUS_KEY);
    }
  }, [hasCompletedOnboarding]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BUILDING_PARAMS_KEY, JSON.stringify(buildingParams));
      localStorage.removeItem(LEGACY_BUILDING_PARAMS_KEY);
    }
  }, [buildingParams]);

  const value = useMemo<AppStateContextValue>(() => ({
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
    completeOnboarding,
    resetOnboarding,
    signOut,
  }), [
    buildingParams,
    activeRetrofits,
    emergencyMode,
    analysis,
    currentView,
    snapshotGenerator,
    registerSnapshot,
    handleRunAnalysis,
    hasCompletedOnboarding,
    completeOnboarding,
    resetOnboarding,
    signOut,
  ]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = (): AppStateContextValue => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
