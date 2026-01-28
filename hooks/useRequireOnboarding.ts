import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../state/AppStateContext';

export const useRequireOnboarding = () => {
  const { hasCompletedOnboarding } = useAppState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      navigate('/setup', { replace: true });
    }
  }, [hasCompletedOnboarding, navigate]);
};
