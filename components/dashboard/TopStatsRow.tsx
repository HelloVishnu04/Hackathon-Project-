import React from 'react';
import { Activity, AlertTriangle, Wind, Wifi } from 'lucide-react';
import { AnalysisResult } from '../../types';

type Props = {
  liveHealth: number;
  analysis: AnalysisResult | null;
  seismicStatus: 'Normal' | 'Moderate' | 'Critical';
  toggleSeismicActivity: () => void;
  activeSensors: number;
  totalSensors: number;
  emergencyMode: boolean;
  setEmergencyMode: (m: boolean) => void;
};

const TopStatsRow: React.FC<Props> = ({
  liveHealth,
  analysis,
  seismicStatus,
  toggleSeismicActivity,
  activeSensors,
  totalSensors,
  emergencyMode,
  setEmergencyMode,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        className={`bg-slate-800/50 backdrop-blur p-4 rounded-xl border transition-all duration-300 ${liveHealth < 50 ? 'border-red-500/50 bg-red-900/10' : 'border-slate-700'}`}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-400 text-xs font-mono mb-1 uppercase">Structural Integrity</p>
            <h3
              className={`text-2xl font-bold ${liveHealth < 40 ? 'text-red-500 animate-pulse' : liveHealth < 70 ? 'text-yellow-400' : 'text-green-400'}`}
            >
              {liveHealth.toFixed(1)}%
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">
              {liveHealth < 40 ? 'CRITICAL INSTABILITY' : analysis ? 'Real-time AI adjusted' : 'Baseline Estimate'}
            </p>
          </div>
          <Activity className={`${liveHealth < 40 ? 'text-red-500' : 'text-slate-500'} w-5 h-5`} />
        </div>
      </div>

      <div
        onClick={toggleSeismicActivity}
        className={`cursor-pointer bg-slate-800/50 backdrop-blur p-4 rounded-xl border border-slate-700 transition-all hover:bg-slate-700/50 ${seismicStatus === 'Critical' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : ''}`}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-400 text-xs font-mono mb-1 uppercase">Seismic Activity</p>
            <h3
              className={`text-2xl font-bold ${seismicStatus === 'Normal' ? 'text-cyan-400' : seismicStatus === 'Moderate' ? 'text-orange-400' : 'text-red-500'}`}
            >
              {seismicStatus}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">Click to Simulate Event</p>
          </div>
          <Wind className={`${seismicStatus === 'Critical' ? 'text-red-500 animate-bounce' : 'text-slate-500'} w-5 h-5`} />
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur p-4 rounded-xl border border-slate-700">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-400 text-xs font-mono mb-1 uppercase">Active Sensors</p>
            <h3 className="text-2xl font-bold text-indigo-400">
              {activeSensors}
              <span className="text-base text-slate-500">/{totalSensors}</span>
            </h3>
            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Data Streaming
            </p>
          </div>
          <Wifi className="text-indigo-500/50 w-5 h-5" />
        </div>
      </div>

      <div
        className={`bg-slate-800/50 backdrop-blur p-4 rounded-xl border transition-all cursor-pointer ${emergencyMode ? 'border-red-500 bg-red-950/30' : 'border-slate-700 hover:bg-red-900/10'}`}
        onClick={() => setEmergencyMode(!emergencyMode)}
      >
        <div className="flex justify-between items-start">
          <div>
            <p
              className={`${emergencyMode ? 'text-red-400' : 'text-slate-400'} text-xs font-mono mb-1 uppercase`}
            >
              Emergency Mode
            </p>
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
  );
};

export default TopStatsRow;
