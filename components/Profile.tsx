import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Award, 
  Settings2,
  Building,
  Save,
  Shield,
  PlayCircle,
  Loader2,
  Check,
  ArrowRight
} from 'lucide-react';
import { BuildingParams, BuildingTypology } from '../types';

interface ProfileProps {
  buildingParams: BuildingParams;
  setBuildingParams: (p: BuildingParams) => void;
  onRunAnalysis: () => Promise<void>;
  onboardingMode?: boolean;
  onCompleteOnboarding?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ 
  buildingParams, 
  setBuildingParams, 
  onRunAnalysis,
  onboardingMode = false,
  onCompleteOnboarding
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleParamChange = (key: keyof BuildingParams, value: any) => {
    setBuildingParams({ ...buildingParams, [key]: value });
    setSaveSuccess(false); // Reset save state on change
  };

  const handleSaveConfig = () => {
    setIsSaving(true);
    // Simulate API/Local Storage latency
    setTimeout(() => {
        localStorage.setItem('structura_building_params', JSON.stringify(buildingParams));
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  const handleRunDiagnostics = async () => {
      setIsAnalyzing(true);
      await onRunAnalysis();
      setIsAnalyzing(false);
      
      // If in onboarding mode, move to next step after analysis
      if (onboardingMode && onCompleteOnboarding) {
        onCompleteOnboarding();
      }
  };

  return (
    <div className="flex flex-col h-full gap-6 p-6 overflow-y-auto">
      
      {/* Onboarding Welcome Message */}
      {onboardingMode && (
        <div className="bg-gradient-to-r from-indigo-900/50 to-slate-900 border border-indigo-500/30 p-6 rounded-xl animate-fade-in">
           <h2 className="text-xl font-bold text-white mb-2">Initialize Your Building Project</h2>
           <p className="text-slate-300">
             Before accessing the main dashboard, please configure the structural parameters of your building. 
             This data allows our AI to generate an accurate digital twin and vulnerability assessment.
           </p>
        </div>
      )}

      {/* Profile Header (Hidden in Onboarding to focus on inputs, or simplified) */}
      {!onboardingMode && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-orange-600 to-red-700 relative">
            <div className="absolute -bottom-10 left-8">
              <div className="w-24 h-24 rounded-full bg-slate-800 p-1">
                <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center border-2 border-orange-400 overflow-hidden">
                  <span className="text-2xl font-bold text-slate-300">AR</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-12 px-8 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-white">Amit Roy</h1>
                <p className="text-orange-400 font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Chief Structural Consultant
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors text-white border border-slate-600">
                  Edit Consultant Details
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <Mail className="w-4 h-4 text-slate-500" /> a.roy@structura-india.in
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <Phone className="w-4 h-4 text-slate-500" /> +91 98765 43210
                </div>
              </div>
              <div className="space-y-3">
                 <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <Award className="w-4 h-4 text-slate-500" /> Reg: IS-SE-2024-8892
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <MapPin className="w-4 h-4 text-slate-500" /> Mumbai, Maharashtra
                </div>
              </div>
              <div className="space-y-3">
                 <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <Shield className="w-4 h-4 text-slate-500" /> Grade: Senior Level
                </div>
                 <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <Building className="w-4 h-4 text-slate-500" /> Roy Structural Consultants
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Section */}
      <div className={`grid grid-cols-1 ${onboardingMode ? 'lg:grid-cols-1 max-w-4xl mx-auto w-full' : 'lg:grid-cols-3'} gap-6`}>
        
        {/* Building Configuration Panel */}
        <div className={`${onboardingMode ? 'lg:col-span-1' : 'lg:col-span-2'} bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6 flex flex-col`}>
          <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
             <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Project Configuration (IS Codes)</h2>
             </div>
             {saveSuccess && (
                 <span className="text-green-400 text-xs font-medium flex items-center gap-1 animate-fade-in">
                     <Check className="w-3 h-3" /> Saved Locally
                 </span>
             )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
               <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Building Typology</label>
               <select 
                value={buildingParams.typology}
                onChange={(e) => handleParamChange('typology', e.target.value as BuildingTypology)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              >
                <option value="StiltApartment">Stilt Parking Apt (G+4/5)</option>
                <option value="IndianApartment">Apartment w/ Balconies</option>
                <option value="ModernHighRise">Modern High-Rise (Glass/Conc)</option>
                <option value="IndependentHouse">Independent House (G+2)</option>
                <option value="KutchaHouse">Kutcha House (Mud/Brick)</option>
                <option value="Temple">Traditional Temple</option>
                <option value="IndustrialShed">Industrial Shed / Warehouse</option>
              </select>
               <p className="text-[10px] text-slate-500">Select specific Indian building style for accurate visual & risk analysis.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Construction Year</label>
              <input 
                type="number" 
                value={buildingParams.year}
                onChange={(e) => handleParamChange('year', parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              />
              <p className="text-[10px] text-slate-500">Pre-2002 buildings lack ductile detailing.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Number of Floors</label>
              <input 
                type="number" 
                value={buildingParams.floors}
                onChange={(e) => handleParamChange('floors', parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Primary Material</label>
              <select 
                value={buildingParams.material}
                onChange={(e) => handleParamChange('material', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              >
                <option value="Concrete">RCC (Reinforced Concrete)</option>
                <option value="Steel">Structural Steel</option>
                <option value="Masonry">Brick Masonry</option>
                <option value="Stone">Stone Masonry</option>
                <option value="MudMortar">Mud Mortar / Adobe</option>
                <option value="Timber">Timber / Composite</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Seismic Zone (IS 1893)</label>
              <select 
                value={buildingParams.seismicZone}
                onChange={(e) => handleParamChange('seismicZone', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              >
                <option value="Zone II">Zone II (Low Risk - e.g. Bangalore)</option>
                <option value="Zone III">Zone III (Moderate - e.g. Chennai, Mumbai)</option>
                <option value="Zone IV">Zone IV (High - e.g. Delhi NCR)</option>
                <option value="Zone V">Zone V (Very High - e.g. Guwahati, Bhuj)</option>
              </select>
            </div>
            <div className="space-y-2">
               <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Occupancy Type</label>
               <select 
                value={buildingParams.occupancy}
                onChange={(e) => handleParamChange('occupancy', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              >
                <option value="Residential">Residential Apt</option>
                <option value="Commercial">Commercial/Office</option>
                <option value="Industrial">Industrial</option>
                <option value="Religious">Religious/Temple</option>
              </select>
            </div>
             <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Inspection</label>
              <input 
                type="date" 
                value={buildingParams.lastInspection}
                onChange={(e) => handleParamChange('lastInspection', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-6">
            <h3 className="text-sm font-semibold text-cyan-400 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4" /> Material Specs
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {buildingParams.material === 'Concrete' && (
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Concrete Grade</label>
                   <select 
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200 focus:border-cyan-500 outline-none"
                    defaultValue="M25"
                  >
                    <option>M20</option>
                    <option>M25</option>
                    <option>M30</option>
                    <option>M40</option>
                  </select>
                </div>
              )}
              {buildingParams.material === 'Steel' && (
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Steel Grade</label>
                   <select 
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200 focus:border-cyan-500 outline-none"
                    defaultValue="Fe500"
                  >
                    <option>Fe250</option>
                    <option>Fe415</option>
                    <option>Fe500</option>
                  </select>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Soil Type (IS 1893)</label>
                 <select 
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200 focus:border-cyan-500 outline-none"
                    defaultValue="Type II"
                  >
                    <option>Type I (Rock)</option>
                    <option>Type II (Medium)</option>
                    <option>Type III (Soft)</option>
                  </select>
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col md:flex-row gap-3 pt-4 border-t border-slate-700">
             <button 
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
             >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save Configuration'}
             </button>
             
             <button 
                onClick={handleRunDiagnostics}
                disabled={isAnalyzing}
                className={`flex-1 flex items-center justify-center gap-2 text-white px-4 py-3 rounded-lg font-bold transition-all shadow-lg ${
                  onboardingMode 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-900/20' 
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-900/20'
                }`}
             >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : onboardingMode ? <ArrowRight className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                {isAnalyzing ? 'Running Model...' : onboardingMode ? 'Initialize & Enter Dashboard' : 'Run Diagnostics'}
             </button>
          </div>
        </div>

        {/* Stats / Side Panel (Hidden in Onboarding) */}
        {!onboardingMode && (
          <div className="space-y-6">
             <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6">
               <h3 className="text-sm font-semibold text-slate-300 mb-4">Account Statistics</h3>
               <div className="space-y-4">
                 <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                   <span className="text-sm text-slate-400">Sites Analyzed</span>
                   <span className="text-lg font-bold text-white">42</span>
                 </div>
                 <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                   <span className="text-sm text-slate-400">NOC Generated</span>
                   <span className="text-lg font-bold text-white">156</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm text-slate-400">IoT Active</span>
                   <span className="text-lg font-bold text-green-400">12</span>
                 </div>
               </div>
             </div>
             
             <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl border border-indigo-500/30 p-6 shadow-lg">
               <h3 className="text-sm font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                   <Settings2 className="w-4 h-4" /> Quick Actions
               </h3>
               <ul className="space-y-2">
                   <li><button className="text-xs text-slate-300 hover:text-white hover:underline text-left w-full">Export Configuration (JSON)</button></li>
                   <li><button className="text-xs text-slate-300 hover:text-white hover:underline text-left w-full">Import Configuration</button></li>
                   <li><button className="text-xs text-slate-300 hover:text-white hover:underline text-left w-full">Reset to Defaults</button></li>
               </ul>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;