import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Wind, 
  ShieldCheck, 
  DollarSign, 
  Hammer,
  PlayCircle,
  Settings2,
  FileDown,
  ChevronRight,
  Wifi
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { jsPDF } from 'jspdf';
import { AnalysisResult, BuildingParams, RetrofitOption, SensorData, ViewMode } from '../types';
import { analyzeBuildingStructure } from '../services/geminiService';

interface DashboardProps {
  buildingParams: BuildingParams;
  setBuildingParams: (p: BuildingParams) => void;
  activeRetrofits: string[];
  setActiveRetrofits: React.Dispatch<React.SetStateAction<string[]>>;
  emergencyMode: boolean;
  setEmergencyMode: (m: boolean) => void;
  analysis: AnalysisResult | null;
  setAnalysis: (a: AnalysisResult) => void;
  getSnapshot?: () => string;
  setView: (view: ViewMode) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  buildingParams,
  setBuildingParams,
  activeRetrofits,
  setActiveRetrofits,
  emergencyMode,
  setEmergencyMode,
  analysis,
  setAnalysis,
  getSnapshot,
  setView
}) => {
  const [loading, setLoading] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // New States for Live Functionality
  const [seismicStatus, setSeismicStatus] = useState<'Normal' | 'Moderate' | 'Critical'>('Normal');
  const [liveHealth, setLiveHealth] = useState<number>(100);

  // Derived Stats
  const totalSensors = buildingParams.floors * 4 + 6; // 4 per floor + 6 base/roof
  const activeSensors = emergencyMode ? totalSensors : Math.floor(totalSensors * 0.9); // Simulate some loss if not emergency, or full if scanning

  // Real-time Sensor Simulation Engine
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      
      // Base factors
      let vibrationBase = 0.05;
      let stressBase = 15;
      
      // 1. Seismic Activity Impact
      if (seismicStatus === 'Moderate') {
        vibrationBase = 1.5;
        stressBase = 40;
      } else if (seismicStatus === 'Critical') {
        vibrationBase = 4.5;
        stressBase = 85;
      }

      // 2. Emergency Mode Multiplier
      if (emergencyMode) {
        stressBase += 10; // Panic load / Evacuation movement
      }

      // 3. Random noise generator
      const randomNoise = Math.random();
      
      // Calculate final sensor values
      const currentVibration = vibrationBase + (randomNoise * 0.5);
      const currentStress = stressBase + (randomNoise * 10);
      
      const newPoint: SensorData = {
        time: now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        vibration: parseFloat(currentVibration.toFixed(2)),
        stress: parseFloat(currentStress.toFixed(1)),
        temperature: 28 + Math.random(),
        humidity: 65 + Math.random() * 5
      };

      setSensorData(prev => {
        const newData = [...prev, newPoint];
        if (newData.length > 20) newData.shift();
        return newData;
      });

      // 4. "Smart Advisor" Logic: Link DL Model to Real-time Events
      if (analysis) {
        // Calculate Live Structural Health
        // Formula: (100 - Base_Risk) - (Stress_Penalty)
        // A high risk building suffers more from stress than a low risk one.
        const riskFactor = analysis.vulnerabilityScore / 100; // 0.1 to 0.9
        const stressPenalty = (currentStress / 100) * 20 * (1 + riskFactor); 
        
        let calculatedHealth = (100 - analysis.vulnerabilityScore) - stressPenalty;
        calculatedHealth = Math.min(Math.max(calculatedHealth, 0), 100);
        setLiveHealth(calculatedHealth);

        // Auto-Trigger Emergency Mode based on DL Thresholds
        // Weaker buildings trigger alerts at lower vibration levels
        const safetyThreshold = 5 * (1 - riskFactor); // Strong bldg: ~4.5g, Weak bldg: ~1.0g
        
        if (currentVibration > safetyThreshold && !emergencyMode) {
          setEmergencyMode(true);
        }
      } else {
        // Default Mock Health if no analysis run yet
        setLiveHealth(100 - (currentStress * 0.5));
      }

    }, 1000);
    return () => clearInterval(interval);
  }, [emergencyMode, seismicStatus, analysis, setEmergencyMode]);

  const handleRunAnalysis = async () => {
    setLoading(true);
    const result = await analyzeBuildingStructure(buildingParams);
    setAnalysis(result);
    // Reset simulation state on new analysis
    setSeismicStatus('Normal');
    setEmergencyMode(false);
    setLoading(false);
  };

  const toggleRetrofit = (option: RetrofitOption) => {
    setActiveRetrofits(prev => {
      if (prev.includes(option.type)) {
        return prev.filter(id => id !== option.type);
      }
      return [...prev, option.type];
    });
  };

  const toggleSeismicActivity = () => {
    if (seismicStatus === 'Normal') setSeismicStatus('Moderate');
    else if (seismicStatus === 'Moderate') setSeismicStatus('Critical');
    else setSeismicStatus('Normal');
  };

  const handleGenerateReport = async () => {
    if (!analysis) return;
    setGeneratingReport(true);
    // For specific implementation in this update, we focus on the live cards.
    setGeneratingReport(false);
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4 overflow-y-auto">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: Live Structural Health */}
        <div className={`bg-slate-800/50 backdrop-blur p-4 rounded-xl border transition-all duration-300 ${liveHealth < 50 ? 'border-red-500/50 bg-red-900/10' : 'border-slate-700'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-mono mb-1 uppercase">Structural Integrity</p>
              <h3 className={`text-2xl font-bold ${liveHealth < 40 ? 'text-red-500 animate-pulse' : liveHealth < 70 ? 'text-yellow-400' : 'text-green-400'}`}>
                {liveHealth.toFixed(1)}%
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">
                {liveHealth < 40 ? 'CRITICAL INSTABILITY' : analysis ? 'Real-time AI adjusted' : 'Baseline Estimate'}
              </p>
            </div>
            <Activity className={`${liveHealth < 40 ? 'text-red-500' : 'text-slate-500'} w-5 h-5`} />
          </div>
        </div>

        {/* Card 2: Interactive Seismic Activity */}
        <div 
          onClick={toggleSeismicActivity}
          className={`cursor-pointer bg-slate-800/50 backdrop-blur p-4 rounded-xl border border-slate-700 transition-all hover:bg-slate-700/50 ${seismicStatus === 'Critical' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : ''}`}
        >
          <div className="flex justify-between items-start">
             <div>
              <p className="text-slate-400 text-xs font-mono mb-1 uppercase">Seismic Activity</p>
              <h3 className={`text-2xl font-bold ${seismicStatus === 'Normal' ? 'text-cyan-400' : seismicStatus === 'Moderate' ? 'text-orange-400' : 'text-red-500'}`}>
                {seismicStatus}
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Click to Simulate Event</p>
            </div>
            <Wind className={`${seismicStatus === 'Critical' ? 'text-red-500 animate-bounce' : 'text-slate-500'} w-5 h-5`} />
          </div>
        </div>

        {/* Card 3: Active IoT Sensors */}
        <div className="bg-slate-800/50 backdrop-blur p-4 rounded-xl border border-slate-700">
           <div className="flex justify-between items-start">
             <div>
              <p className="text-slate-400 text-xs font-mono mb-1 uppercase">Active Sensors</p>
              <h3 className="text-2xl font-bold text-indigo-400">
                {activeSensors}<span className="text-base text-slate-500">/{totalSensors}</span>
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Data Streaming
              </p>
            </div>
            <Wifi className="text-indigo-500/50 w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Emergency Mode */}
        <div 
          className={`bg-slate-800/50 backdrop-blur p-4 rounded-xl border transition-all cursor-pointer ${emergencyMode ? 'border-red-500 bg-red-950/30' : 'border-slate-700 hover:bg-red-900/10'}`} 
          onClick={() => setEmergencyMode(!emergencyMode)}
        >
           <div className="flex justify-between items-start">
             <div>
              <p className={`${emergencyMode ? 'text-red-400' : 'text-slate-400'} text-xs font-mono mb-1 uppercase`}>Emergency Mode</p>
              <h3 className={`text-2xl font-bold ${emergencyMode ? 'text-red-500' : 'text-slate-200'}`}>
                {emergencyMode ? 'ACTIVE' : 'READY'}
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">
                {emergencyMode ? 'Evacuation Protocols Initiated' : 'System Standby'}
              </p>
            </div>
            <AlertTriangle className={`w-5 h-5 ${emergencyMode ? 'text-red-500 animate-ping' : 'text-slate-500'}`} />
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-grow">
        
        {/* Left Col: Analysis & Retrofits */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck className="text-cyan-400" /> AI Retrofit Advisor
              </h2>
              {analysis && (
                 <button 
                  onClick={handleGenerateReport} 
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                 >
                   <FileDown className="w-3 h-3" />
                   Generate Report
                 </button>
              )}
            </div>
            
            {/* Configuration Summary */}
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-4">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 text-slate-300">
                   <Settings2 className="w-4 h-4" />
                   <span className="text-sm font-semibold">Active Configuration</span>
                 </div>
                 <button 
                   onClick={() => setView('profile')}
                   className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                 >
                   Edit in Profile <ChevronRight className="w-3 h-3" />
                 </button>
              </div>
              <div className="flex gap-4 text-xs text-slate-400">
                 <span>{buildingParams.typology}</span>
                 <span>•</span>
                 <span>{buildingParams.floors} Floors</span>
                 <span>•</span>
                 <span>{buildingParams.seismicZone}</span>
              </div>
            </div>

            {!analysis ? (
              <div className="flex flex-col gap-4 text-center py-8">
                <p className="text-slate-400 text-sm">Review the active configuration above and run diagnostics to generate safety insights.</p>
                <button 
                  onClick={handleRunAnalysis}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-cyan-900/20"
                >
                  {loading ? <Activity className="animate-spin w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                  {loading ? 'Processing Structural Model...' : 'Run Structural Diagnostics'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-slate-400 font-mono">ANALYSIS COMPLETE</p>
                    <button onClick={() => setAnalysis(null as any)} className="text-xs text-cyan-400 hover:underline">Recalculate</button>
                 </div>
                <div className="bg-slate-900/50 p-3 rounded-lg border-l-4 border-yellow-500">
                  <p className="text-sm text-slate-300">{analysis.summary}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-mono text-slate-500 uppercase">Recommended Interventions</p>
                  {analysis.recommendations && analysis.recommendations.length > 0 ? (
                    analysis.recommendations.map((rec) => (
                    <div key={rec.id} className="bg-slate-700/30 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-white">{rec.name}</h4>
                          <p className="text-xs text-slate-400">{rec.description}</p>
                        </div>
                        <span className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded font-mono">
                          +{rec.riskReduction}% Safety
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex gap-4 text-xs text-slate-300">
                          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {rec.costEstimate}</span>
                          <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> ROI: {rec.roi}/10</span>
                        </div>
                        <button 
                          onClick={() => toggleRetrofit(rec)}
                          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                            activeRetrofits.includes(rec.type) 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-slate-600 text-white hover:bg-slate-500'
                          }`}
                        >
                          {activeRetrofits.includes(rec.type) ? 'Applied' : 'Visualize'}
                        </button>
                      </div>
                    </div>
                  ))) : (
                    <p className="text-sm text-slate-500 italic">No specific recommendations provided by AI.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Sensor Data & ROI */}
        <div className="flex flex-col gap-4">
          <div className={`bg-slate-800 p-6 rounded-xl border shadow-lg min-h-[300px] transition-colors ${emergencyMode ? 'border-red-500/50' : 'border-slate-700'}`}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className={emergencyMode ? "text-red-400 animate-pulse" : "text-cyan-400"} /> 
              Real-Time Structural Strain
              {emergencyMode && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded ml-2">ALERT</span>}
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tick={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="vibration" 
                    name="Vibration (g)" 
                    stroke="#f472b6" 
                    strokeWidth={2} 
                    dot={false} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="stress" 
                    name="Stress (MPa)" 
                    stroke={emergencyMode ? "#ef4444" : "#22d3ee"} 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Simulated IoT Data Stream • {seismicStatus} Seismic Conditions
            </p>
          </div>

           {analysis && analysis.recommendations && (
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex-grow">
               <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="text-green-400" /> Cost vs. Risk Reduction
              </h2>
               <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={analysis.recommendations || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val ? val.split(' ')[0] : ''} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }} 
                        cursor={{fill: '#334155', opacity: 0.4}}
                      />
                      <Legend />
                      <Bar dataKey="roi" name="ROI Score" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="riskReduction" name="Risk Reduction %" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;