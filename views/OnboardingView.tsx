import React, { useCallback, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';

import Profile from '../components/Profile';

import { useAppState } from '../state/AppStateContext';



const OnboardingView: React.FC = () => {

  const {

    buildingParams,

    setBuildingParams,

    handleRunAnalysis,

    hasCompletedOnboarding,

    completeOnboarding,

    setCurrentView,

  } = useAppState();

  const navigate = useNavigate();



  useEffect(() => {

    if (hasCompletedOnboarding) {

      navigate('/app', { replace: true });

    }

  }, [hasCompletedOnboarding, navigate]);



  const handleComplete = useCallback(() => {

    completeOnboarding();

    setCurrentView('dashboard');

    navigate('/app', { replace: true });

  }, [completeOnboarding, navigate, setCurrentView]);



  return (

    <Layout currentView="profile" setView={() => {}} onboardingMode>

      <Profile

        buildingParams={buildingParams}

        setBuildingParams={setBuildingParams}

        onRunAnalysis={handleRunAnalysis}

        onboardingMode

        onCompleteOnboarding={handleComplete}

      />

    </Layout>

  );

};



export default OnboardingView;

