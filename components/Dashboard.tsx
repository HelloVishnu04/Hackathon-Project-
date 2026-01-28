import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle, 
  Hammer
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
import { analyzeBuildingStructure } from '../services/analysisService';
import TopStatsRow from './dashboard/TopStatsRow';
import RetrofitAdvisorPanel from './dashboard/RetrofitAdvisorPanel';
import SensorStrainPanel from './dashboard/SensorStrainPanel';
import RoiChartPanel from './dashboard/RoiChartPanel';

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
      <TopStatsRow
        liveHealth={liveHealth}
        analysis={analysis}
        seismicStatus={seismicStatus}
        toggleSeismicActivity={toggleSeismicActivity}
        activeSensors={activeSensors}
        totalSensors={totalSensors}
        emergencyMode={emergencyMode}
        setEmergencyMode={setEmergencyMode}
      />

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-grow">
        
        {/* Left Col: Analysis & Retrofits */}
        <div className="flex flex-col gap-4">
          <RetrofitAdvisorPanel
            buildingParams={buildingParams}
            analysis={analysis}
            loading={loading}
            handleRunAnalysis={handleRunAnalysis}
            handleGenerateReport={handleGenerateReport}
            setView={setView}
            activeRetrofits={activeRetrofits}
            toggleRetrofit={toggleRetrofit}
            onRecalculate={() => setAnalysis(null as any)}
          />
        </div>

        {/* Right Col: Sensor Data & ROI */}
        <div className="flex flex-col gap-4">
          <SensorStrainPanel emergencyMode={emergencyMode} seismicStatus={seismicStatus} sensorData={sensorData} />
          <RoiChartPanel analysis={analysis} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;