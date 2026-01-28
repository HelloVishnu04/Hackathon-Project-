import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPage from '../components/LandingPage';

const LandingView: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = useCallback(() => {
    navigate('/setup');
  }, [navigate]);

  return <LandingPage onLogin={handleLogin} />;
};

export default LandingView;
