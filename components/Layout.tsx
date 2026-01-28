import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ShieldAlert, Settings, Home, FileText, User, LogOut } from 'lucide-react';
import { ViewMode } from '../types';
import { useAppState } from '../state/AppStateContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
  onboardingMode?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, onboardingMode = false }) => {
  const navigate = useNavigate();
  const { signOut } = useAppState();

  const handleSignOut = () => {
    signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar - Hidden in Onboarding Mode */}
      {!onboardingMode && (
        <aside className="w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col items-center lg:items-start py-6 transition-all duration-300 z-20">
          <div className="px-0 lg:px-6 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Layers className="text-white w-6 h-6" />
            </div>
            <span className="hidden lg:block font-bold text-xl tracking-tight text-white">
              S.<span className="text-cyan-400">A.F.E</span>
            </span>
          </div>

          <nav className="w-full flex-1 flex flex-col gap-2 px-3">
            <NavItem 
              icon={<Home />} 
              label="Overview" 
              active={currentView === 'dashboard'} 
              onClick={() => setView('dashboard')}
            />
            <NavItem 
              icon={<ShieldAlert />} 
              label="Vulnerability Map" 
              active={currentView === 'vulnerability'} 
              onClick={() => setView('vulnerability')}
            />
            <NavItem 
              icon={<FileText />} 
              label="Reports & Plans" 
              active={currentView === 'reports'}
              onClick={() => setView('reports')}
            />
            <NavItem 
              icon={<Settings />} 
              label="Profile & Settings" 
              active={currentView === 'profile'} 
              onClick={() => setView('profile')}
            />
          </nav>

          <div className="px-6 py-4 hidden lg:block w-full">
             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
               <p className="text-xs text-slate-400 mb-2">SYSTEM STATUS</p>
               <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium text-green-400">Online</span>
               </div>
             </div>
             <button onClick={handleSignOut} className="mt-4 flex items-center gap-2 text-slate-500 hover:text-red-400 text-xs transition-colors">
               <LogOut className="w-3 h-3" /> Sign Out
             </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-slate-900/50 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            {onboardingMode && (
              <div className="flex items-center gap-3 lg:hidden">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Layers className="text-white w-5 h-5" />
                </div>
              </div>
            )}
            <h1 className="text-lg font-medium text-slate-200">
              {onboardingMode ? 'Project Setup: Initial Configuration' : (
                <>
                  {currentView === 'dashboard' && 'Building 404: Structural Retrofit Analysis'}
                  {currentView === 'profile' && 'User Profile & Configuration'}
                  {currentView === 'reports' && 'Reports & Emergency Planning'}
                  {currentView === 'vulnerability' && 'Structural Vulnerability Assessment'}
                </>
              )}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div 
              onClick={() => !onboardingMode && setView('profile')}
              className={`w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center transition-colors ${!onboardingMode ? 'cursor-pointer hover:border-cyan-400' : ''}`}
             >
               <span className="text-xs font-bold">JD</span>
             </div>
             {!onboardingMode && (
               <button
                 onClick={handleSignOut}
                 className="hidden lg:flex items-center gap-2 text-xs text-slate-500 hover:text-red-400 transition-colors"
               >
                 <LogOut className="w-3 h-3" />
                 <span>Sign Out</span>
               </button>
             )}
          </div>
        </header>
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${active ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'} ${!onClick ? 'opacity-50 cursor-not-allowed' : ''}`}
    disabled={!onClick}
  >
    {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
    <span className="hidden lg:block text-sm font-medium">{label}</span>
  </button>
);

export default Layout;