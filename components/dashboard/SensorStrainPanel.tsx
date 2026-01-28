import React from 'react';
import { Activity } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SensorData } from '../../types';

type Props = {
  emergencyMode: boolean;
  seismicStatus: 'Normal' | 'Moderate' | 'Critical';
  sensorData: SensorData[];
};

const SensorStrainPanel: React.FC<Props> = ({ emergencyMode, seismicStatus, sensorData }) => {
  return (
    <div
      className={`bg-slate-800 p-6 rounded-xl border shadow-lg min-h-[300px] transition-colors ${
        emergencyMode ? 'border-red-500/50' : 'border-slate-700'
      }`}
    >
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity className={emergencyMode ? 'text-red-400 animate-pulse' : 'text-cyan-400'} />
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
              stroke={emergencyMode ? '#ef4444' : '#22d3ee'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-500 mt-2 text-center">Simulated IoT Data Stream • {seismicStatus} Seismic Conditions</p>
    </div>
  );
};

export default SensorStrainPanel;
