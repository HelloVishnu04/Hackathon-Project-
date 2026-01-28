import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppStateProvider } from './state/AppStateContext';
import LandingView from './views/LandingView';
import OnboardingView from './views/OnboardingView';
import ApplicationView from './views/ApplicationView';

const App: React.FC = () => (
  <AppStateProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingView />} />
        <Route path="/setup" element={<OnboardingView />} />
        <Route path="/app" element={<ApplicationView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AppStateProvider>
);

export default App;