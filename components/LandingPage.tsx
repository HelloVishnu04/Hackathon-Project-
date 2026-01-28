import React, { useState } from 'react';
import { Layers, ShieldCheck, Activity, ChevronRight, Lock, Mail, User } from 'lucide-react';
import BuildingViewer from './3d/BuildingViewer';
import { BuildingParams } from '../types';

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  // Mock params for background visualization
  const demoParams: BuildingParams = {
    year: 2024,
    typology: 'ModernHighRise',
    material: 'Concrete',
    floors: 8,
    seismicZone: 'Zone IV',
    occupancy: 'Commercial',
    lastInspection: '2024-01-01'
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans">
      
      {/* 3D Background Layer */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
         <BuildingViewer 
            params={demoParams}
            activeRetrofits={[]}
            emergencyMode={false}
            vulnerabilityScore={30}
            visualizationMode="standard"
         />
         {/* Gradient Overlay for text readability */}
         <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 h-full flex flex-col md:flex-row">
        
        {/* Left: Info Section */}
        <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Layers className="text-white w-7 h-7" />
              </div>
              <span className="font-bold text-3xl tracking-tight text-white">
                S.<span className="text-cyan-400">A.F.E</span>
              </span>
            </div>
            <p className="mt-2 text-sm uppercase tracking-[0.3em] text-slate-500 font-semibold">
              Seismic Assessment &amp; Forecast Engine
            </p>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Structural Safety, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Reimagined with AI.
            </span>
          </h1>

          <p className="text-slate-400 text-lg mb-8 max-w-lg leading-relaxed">
            Protect your assets with our next-gen retrofitting advisor. 
            Analyze structural integrity, simulate seismic events, and generate 
            retrofit solutions using digital twin technology.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 max-w-lg">
             <div className="flex items-center gap-3 text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800 backdrop-blur-sm">
                <ShieldCheck className="text-green-400 w-5 h-5" />
                <span className="text-sm font-medium">Auto-Compliance Check</span>
             </div>
             <div className="flex items-center gap-3 text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800 backdrop-blur-sm">
                <Activity className="text-red-400 w-5 h-5" />
                <span className="text-sm font-medium">Seismic Simulation</span>
             </div>
          </div>
        </div>

        {/* Right: Auth Section */}
        <div className="w-full md:w-1/2 h-full flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl shadow-2xl transition-all duration-300">
            <h2 className="text-2xl font-bold text-white mb-2">
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {authMode === 'login' ? 'Access your structural dashboard' : 'Start your structural analysis journey'}
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              
              {authMode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@safe.ai"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-300 uppercase">Password</label>
                 <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>
              </div>

              {authMode === 'login' && (
                <div className="flex items-center justify-between text-xs mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded bg-slate-800 border-slate-600 text-cyan-500 focus:ring-offset-slate-900" />
                      <span className="text-slate-400">Remember me</span>
                  </label>
                  <a href="#" className="text-cyan-400 hover:text-cyan-300">Forgot password?</a>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 mt-6"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {authMode === 'login' ? 'Authenticating...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    {authMode === 'login' ? 'Access Dashboard' : 'Get Started'} <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500">
                {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-cyan-400 hover:underline font-medium focus:outline-none"
                >
                  {authMode === 'login' ? "Sign Up Free" : "Log In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;