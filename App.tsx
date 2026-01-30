import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppStateProvider } from './state/AppStateContext';
import LandingView from './views/LandingView';
import OnboardingView from './views/OnboardingView';
import ApplicationView from './views/ApplicationView';

const App: React.FC = () => (
  <AppStateProvider>
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingView />} />
        <Route path="/setup" element={<OnboardingView />} />
        <Route path="/app" element={<ApplicationView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  </AppStateProvider>
);

export default App;