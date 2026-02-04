import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { BuildingParams, AnalysisResult, ViewMode } from '../types';
import { analyzeBuildingStructure } from '../services/analysisService';
import { supabase } from '../supabase/client';
import {
  fetchPrimaryBuilding,
  fetchUserProfile,
  updateOnboardingStatus,
  upsertPrimaryBuilding,
  upsertUserProfile,
} from '../services/profileService';
import { DEFAULT_PERSONAL_DETAILS, PersonalDetails } from '../types/profile';
import { logStructureInput } from '../services/structureInputService';

type SnapshotGenerator = (() => string) | undefined;

type AppStateContextValue = {
  user: User | null;
  isAuthReady: boolean;
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
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  signOut: () => Promise<void>;
  activeBuildingId: string | null;
  setActiveBuildingId: React.Dispatch<React.SetStateAction<string | null>>;
  refreshUserData: () => Promise<void>;
  personalDetails: PersonalDetails;
  setPersonalDetails: React.Dispatch<React.SetStateAction<PersonalDetails>>;
  savePersonalDetails: (details: PersonalDetails, options?: { onboardingCompleted?: boolean }) => Promise<void>;
  saveBuildingParams: (params: BuildingParams, options?: { name?: string }) => Promise<void>;
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
const PERSONAL_PROFILE_KEY = 'safe_personal_profile';

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
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
  const [activeBuildingId, setActiveBuildingId] = useState<string | null>(null);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(PERSONAL_PROFILE_KEY);
      if (stored) {
        try {
          return { ...DEFAULT_PERSONAL_DETAILS, ...JSON.parse(stored) } as PersonalDetails;
        } catch (error) {
          console.warn('Failed to parse stored personal profile:', error);
        }
      }
    }
    return DEFAULT_PERSONAL_DETAILS;
  });
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

  const hydrateUserData = useCallback(async (userId: string) => {
    try {
      const [profile, building] = await Promise.all([
        fetchUserProfile(userId),
        fetchPrimaryBuilding(userId),
      ]);

      if (profile) {
        setHasCompletedOnboarding(profile.onboardingCompleted);
        setPersonalDetails(profile.personalDetails);
      } else {
        setHasCompletedOnboarding(false);
        setPersonalDetails(DEFAULT_PERSONAL_DETAILS);
      }

      if (building) {
        setActiveBuildingId(building.id);
        setBuildingParams({ ...DEFAULT_BUILDING_PARAMS, ...building.building_params } as BuildingParams);
      } else {
        setActiveBuildingId(null);
      }
    } catch (error) {
      console.error('Failed to hydrate user data:', error);
    }
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

  const completeOnboarding = useCallback(async () => {
    setHasCompletedOnboarding(true);
    if (user) {
      try {
        await updateOnboardingStatus(user.id, true);
      } catch (error) {
        console.error('Failed to persist onboarding status:', error);
      }
    }
  }, [user]);

  const resetOnboarding = useCallback(async () => {
    setHasCompletedOnboarding(false);
    if (user) {
      try {
        await updateOnboardingStatus(user.id, false);
      } catch (error) {
        console.error('Failed to reset onboarding status:', error);
      }
    }
  }, [user]);

  const resetLocalState = useCallback(() => {
    setBuildingParams({ ...DEFAULT_BUILDING_PARAMS });
    setActiveRetrofits([]);
    setEmergencyMode(false);
    setAnalysis(null);
    setCurrentView('dashboard');
    setSnapshotGenerator(undefined);
    setActiveBuildingId(null);
    setHasCompletedOnboarding(false);
    setPersonalDetails(DEFAULT_PERSONAL_DETAILS);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(BUILDING_PARAMS_KEY);
      localStorage.removeItem(ONBOARDING_STATUS_KEY);
      localStorage.removeItem(LEGACY_BUILDING_PARAMS_KEY);
      localStorage.removeItem(LEGACY_ONBOARDING_STATUS_KEY);
      localStorage.removeItem(PERSONAL_PROFILE_KEY);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Supabase sign-out failed:', error);
    } finally {
      setUser(null);
      resetLocalState();
    }
  }, [resetLocalState]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;

        const sessionUser = data.session?.user ?? null;
        setUser(sessionUser);

        if (sessionUser) {
          await hydrateUserData(sessionUser.id);
        } else {
          resetLocalState();
        }
      } catch (error) {
        console.error('Failed to initialize auth session:', error);
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    };

    initializeAuth();

    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) {
        return;
      }

      const sessionUser = session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        await hydrateUserData(sessionUser.id);
      } else {
        resetLocalState();
      }

      setIsAuthReady(true);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [hydrateUserData, resetLocalState]);

  const refreshUserData = useCallback(async () => {
    if (user) {
      await hydrateUserData(user.id);
    }
  }, [hydrateUserData, user]);

  const savePersonalDetails = useCallback(
    async (details: PersonalDetails, options?: { onboardingCompleted?: boolean }) => {
      setPersonalDetails(details);

      if (typeof window !== 'undefined') {
        localStorage.setItem(PERSONAL_PROFILE_KEY, JSON.stringify(details));
      }

      if (!user) {
        return;
      }

      try {
        await upsertUserProfile(user.id, details, options?.onboardingCompleted);
      } catch (error) {
        console.error('Failed to persist personal details:', error);
        throw error;
      }
    },
    [user],
  );

  const saveBuildingParams = useCallback(
    async (params: BuildingParams, options?: { name?: string }) => {
      setBuildingParams(params);

      if (!user) {
        return;
      }

      try {
        const record = await upsertPrimaryBuilding(user.id, params, {
          buildingId: activeBuildingId ?? undefined,
          name: options?.name,
        });
        setActiveBuildingId(record.id);

        try {
          await logStructureInput({
            userId: user.id,
            buildingId: record.id,
            params,
            metadata: options?.name ? { label: options.name } : null,
          });
        } catch (logError) {
          console.warn('Failed to log structure input history:', logError);
        }
      } catch (error) {
        console.error('Failed to persist building configuration:', error);
        throw error;
      }
    },
    [activeBuildingId, user],
  );

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PERSONAL_PROFILE_KEY, JSON.stringify(personalDetails));
    }
  }, [personalDetails]);

  const value = useMemo<AppStateContextValue>(() => ({
    user,
    isAuthReady,
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
    activeBuildingId,
    setActiveBuildingId,
    refreshUserData,
    personalDetails,
    setPersonalDetails,
    savePersonalDetails,
    saveBuildingParams,
  }), [
    user,
    isAuthReady,
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
    activeBuildingId,
    refreshUserData,
    personalDetails,
    savePersonalDetails,
    saveBuildingParams,
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
